/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HarborClient } from '@hapic/harbor';
import { MemoryTransport } from 'hapic';
import type { MemoryResponseInit, TransportRequest } from 'hapic';
import { describe, expect, it } from 'vitest';
import { migrateRegistryProjectArtifacts } from '../../../../../src/app/components/registry/handlers/helpers/migrate-artifacts.ts';

type Artifact = {
    digest: string,
    tags: string[],
    references?: string[],
    accessories?: string[],
    hard?: boolean,
    child?: boolean
};

type Repositories = Map<string, Artifact[]>;

type Interceptor = (request: TransportRequest, url: URL) => MemoryResponseInit | undefined;

const DIGEST = `sha256:${'a'.repeat(64)}`;
const OTHER_DIGEST = `sha256:${'b'.repeat(64)}`;

function createHarbor(source: Repositories = new Map([['image', [{ digest: DIGEST, tags: ['latest'] }]]])) {
    const target: Repositories = new Map();
    let sourceSnapshots = 0;
    let intercept: Interceptor | undefined;
    const transport = new MemoryTransport({
        fetch: (request) => {
            const url = new URL(request.url);
            const intercepted = intercept?.(request, url);

            if (intercepted) {
                return intercepted;
            }

            const match = /^\/api\/v2.0\/projects\/([^/]+)\/repositories(?:\/([^/]+)\/artifacts(?:\/([^/]+)(\/(?:tags|accessories))?)?)?$/.exec(url.pathname);

            if (!match) {
                throw new Error(`Unexpected Harbor request: ${request.method} ${request.url}`);
            }

            const project = decodeURIComponent(match[1]);

            if (project !== 'source' && project !== 'target') {
                throw new Error(`Unexpected project: ${project}`);
            }

            if (project === 'source' && request.method !== 'GET') {
                throw new Error('Source mutation is forbidden');
            }

            const repositories = project === 'source' ? source : target;
            const page = Number(url.searchParams.get('page'));
            const size = Number(url.searchParams.get('page_size'));
            const paginate = <T>(items: T[]) : MemoryResponseInit => {
                expect(size).toBe(100);
                expect(page).toBeGreaterThan(0);

                return { body: items.slice((page - 1) * size, page * size) };
            };

            if (!match[2]) {
                if (project === 'source' && page === 1) {
                    sourceSnapshots++;
                }

                return paginate(repositories.keys().map((name) => ({ name: `${project}/${name}` })).toArray());
            }

            const repository = decodeURIComponent(decodeURIComponent(match[2]));

            // Require Harbor's double escaping, not just a router that accepts both.
            expect(match[2]).toBe(encodeURIComponent(encodeURIComponent(repository)));

            const artifacts = repositories.get(repository);
            const reference = match[3] ? decodeURIComponent(match[3]) : undefined;

            if (!reference) {
                if (request.method === 'GET') {
                    // Embedded tags are deliberately incomplete.
                    return artifacts ? paginate(artifacts.filter((artifact) => !artifact.hard && (!artifact.child || url.searchParams.get('q') === 'base=*')).map(({ digest }) => ({ digest, tags: [] }))) : { status: 404 };
                }

                if (request.method === 'POST' && project === 'target') {
                    const from = url.searchParams.get('from');

                    if (!from) {
                        throw new Error('Missing copy source');
                    }

                    expect(url.search).toBe(`?from=${encodeURIComponent(from)}`);

                    const [sourceRepository, digest] = from.slice('source/'.length).split('@');
                    const original = source.get(sourceRepository)?.find((artifact) => artifact.digest === digest);

                    if (!original || !from.startsWith('source/')) {
                        return { status: 404 };
                    }

                    const alreadyCopied = artifacts?.some((artifact) => artifact.digest === digest);

                    if (alreadyCopied) {
                        return { status: 409 };
                    }

                    const copiedArtifacts = artifacts || [];
                    const copy = (item: Artifact) => {
                        const exists = copiedArtifacts.some((existing) => existing.digest === item.digest);

                        if (exists) {
                            return;
                        }

                        // Harbor COPY can MOVE mutable destination tags. A missing
                        // preflight must therefore be observable as destructive here.
                        for (const existing of copiedArtifacts) {
                            existing.tags = existing.tags.filter((tag) => !item.tags.includes(tag));
                        }

                        copiedArtifacts.push({ ...item, tags: [...item.tags] });

                        for (const child of [...(item.references || []), ...(item.accessories || [])]) {
                            const childArtifact = source.get(sourceRepository)?.find((candidate) => candidate.digest === child);

                            if (!childArtifact) {
                                throw new Error(`Missing fixture child ${child}`);
                            }

                            copy(childArtifact);
                        }
                    };

                    if (original.hard) {
                        throw new Error('Cannot copy a hard accessory as root');
                    }

                    copy(original);
                    repositories.set(repository, copiedArtifacts);

                    return { status: 201 };
                }
            }

            const artifact = artifacts?.find((item) => item.digest === reference || item.tags.includes(reference || ''));

            if (!artifact) {
                return { status: 404 };
            }

            if (match[4] === '/accessories' && request.method === 'GET') {
                return paginate((artifact.accessories || []).map((digest) => ({
                    digest,
                    type: 'signature.cosign',
                    subject_artifact_digest: artifact.digest,
                    subject_artifact_repo: `${project}/${repository}`,
                })));
            }

            if (match[4] === '/tags') {
                if (request.method === 'GET') {
                    return paginate(artifact.tags.map((name) => ({ name })));
                }

                if (request.method === 'POST' && project === 'target') {
                    const { name } = JSON.parse(String(request.body));

                    const tagExists = artifacts?.some((item) => item.tags.includes(name));

                    if (tagExists) {
                        return { status: 409 };
                    }

                    artifact.tags.push(name);

                    return { status: 201 };
                }
            }

            if (request.method === 'GET') {
                return { body: { digest: artifact.digest, references: artifact.references?.map((child) => ({ child_digest: child })) } };
            }

            throw new Error(`Unexpected Harbor request: ${request.method} ${request.url}`);
        },
    });
    const client = new HarborClient({ request: { baseURL: 'https://harbor.test/api/v2.0/', transport } });

    return {
        client,
        source,
        target,
        transport,
        get sourceSnapshots() {
            return sourceSnapshots; 
        },
        setInterceptor(value: Interceptor) {
            intercept = value; 
        },
    };
}

function expectOnlyTargetWrites(harbor: ReturnType<typeof createHarbor>) {
    expect(harbor.transport.requests.every((request) => request.method === 'GET' || (
        request.method === 'POST' && new URL(request.url).pathname.startsWith('/api/v2.0/projects/target/')
    ))).toBe(true);
}

describe('migrateRegistryProjectArtifacts', () => {
    it('paginates repositories, artifacts and more than 100 tags, preserving nested names and untagged digests', async () => {
        const tags = Array.from({ length: 201 }, (_, index) => `tag-${index}`);
        const artifacts = Array.from({ length: 101 }, (_, index) => ({
            digest: `sha256:${index.toString(16).padStart(64, '0')}`,
            tags: index === 0 ? tags : [],
        }));
        const source: Repositories = new Map([
            ['nested/path/image', artifacts],
            ...Array.from({ length: 100 }, (_, index) : [string, Artifact[]] => [`image-${index}`, []]),
        ]);
        const before = JSON.stringify([...source]);
        const harbor = createHarbor(source);

        await migrateRegistryProjectArtifacts(harbor.client, 'source', 'target');

        expect(harbor.target.get('nested/path/image')?.map((artifact) => ({ ...artifact, tags: artifact.tags.toSorted() })))
            .toEqual(artifacts.map((artifact) => ({ ...artifact, tags: artifact.tags.toSorted() })));
        expect(JSON.stringify([...source])).toBe(before);
        expect(harbor.sourceSnapshots).toBe(2);

        const urls = harbor.transport.requests.map((request) => request.url);

        expect(urls.some((url) => url.includes('nested%252Fpath%252Fimage/artifacts?q=base%3D*&page=2'))).toBe(true);
        expect(urls.some((url) => url.includes('/repositories?page=2'))).toBe(true);
        expect(urls.some((url) => url.includes('/tags?page=3'))).toBe(true);
        expect(urls.some((url) => url.includes(`?from=${encodeURIComponent(`source/nested/path/image@${artifacts[0].digest}`)}`))).toBe(true);
        expectOnlyTargetWrites(harbor);
    });

    it('is idempotent on retry, verifying actual artifacts and tags after copy/tag 409s', async () => {
        const harbor = createHarbor();

        await migrateRegistryProjectArtifacts(harbor.client, 'source', 'target');
        await migrateRegistryProjectArtifacts(harbor.client, 'source', 'target');
        expect(harbor.target.get('image')).toEqual(harbor.source.get('image'));
        expect(harbor.sourceSnapshots).toBe(4);
        expectOnlyTargetWrites(harbor);
    });

    it('retries a partial copy without losing already copied digests or tags', async () => {
        const harbor = createHarbor(new Map([['image', [
            { digest: DIGEST, tags: ['first'] },
            { digest: OTHER_DIGEST, tags: ['second'] },
        ]]]));

        harbor.setInterceptor((request, url) => (
            request.method === 'POST' && url.searchParams.get('from') === `source/image@${OTHER_DIGEST}` ?
                { status: 503 } : undefined
        ));

        await expect(migrateRegistryProjectArtifacts(harbor.client, 'source', 'target')).rejects.toThrow();
        expect(harbor.target.get('image')).toHaveLength(1);
        harbor.setInterceptor(() => undefined);

        await migrateRegistryProjectArtifacts(harbor.client, 'source', 'target');

        expect(harbor.target.get('image')).toEqual(harbor.source.get('image'));
        expectOnlyTargetWrites(harbor);
    });

    it('rejects an existing destination tag bound to a different digest before copying', async () => {
        const harbor = createHarbor();

        harbor.target.set('image', [{ digest: OTHER_DIGEST, tags: ['latest'] }]);
        await expect(migrateRegistryProjectArtifacts(harbor.client, 'source', 'target')).rejects.toThrow('digest mismatch');
        expect(harbor.transport.requests.every((request) => request.method === 'GET')).toBe(true);
    });

    it.each([201, 409])('does not accept a copy status %s without the destination digest', async (status) => {
        const harbor = createHarbor();

        harbor.setInterceptor((request, url) => (request.method === 'POST' && url.searchParams.has('from') ? { status } : undefined));
        await expect(migrateRegistryProjectArtifacts(harbor.client, 'source', 'target')).rejects.toThrow();
        expect(harbor.sourceSnapshots).toBe(1);
        expectOnlyTargetWrites(harbor);
    });

    it('rejects a destination digest mismatch even after a successful copy response', async () => {
        const harbor = createHarbor();

        harbor.setInterceptor((request, url) => (
            request.method === 'GET' && url.pathname.includes(`/target/repositories/image/artifacts/${encodeURIComponent(DIGEST)}`) ?
                { body: { digest: OTHER_DIGEST } } : undefined
        ));
        await expect(migrateRegistryProjectArtifacts(harbor.client, 'source', 'target')).rejects.toThrow('digest mismatch');
    });

    it.each([201, 409])('does not accept tag status %s without verifying the tag binding', async (status) => {
        const harbor = createHarbor();

        harbor.setInterceptor((request, url) => {
            if (request.method === 'POST' && url.pathname.endsWith('/tags')) {
                harbor.target.get('image')?.forEach((artifact) => {
                    artifact.tags = []; 
                });

                return { status };
            }

            return undefined;
        });
        await expect(migrateRegistryProjectArtifacts(harbor.client, 'source', 'target')).rejects.toThrow();
        expectOnlyTargetWrites(harbor);
    });

    it('rejects a tag conflict introduced between the preflight and tag creation', async () => {
        const harbor = createHarbor();

        harbor.setInterceptor((request, url) => {
            if (request.method === 'POST' && url.pathname.endsWith('/tags')) {
                harbor.target.get('image')?.forEach((artifact) => {
                    artifact.tags = []; 
                });
                harbor.target.get('image')?.push({ digest: OTHER_DIGEST, tags: ['latest'] });

                return { status: 409 };
            }

            return undefined;
        });
        await expect(migrateRegistryProjectArtifacts(harbor.client, 'source', 'target')).rejects.toThrow('digest mismatch');
    });

    it.each(['copy', 'tag', 'verification', 'inventory'])('propagates %s failures without mutating source', async (stage) => {
        const harbor = createHarbor();

        harbor.setInterceptor((request, url) => {
            if (
                (stage === 'copy' && request.method === 'POST' && url.searchParams.has('from')) ||
                (stage === 'tag' && request.method === 'POST' && url.pathname.endsWith('/tags')) ||
                (stage === 'verification' && request.method === 'GET' && url.pathname.includes(`/target/repositories/image/artifacts/${encodeURIComponent(DIGEST)}`)) ||
                (stage === 'inventory' && url.pathname.includes('/source/repositories/image/artifacts'))
            ) {
                return { status: 500 };
            }

            return undefined;
        });
        await expect(migrateRegistryProjectArtifacts(harbor.client, 'source', 'target')).rejects.toThrow();
        expect(harbor.source.get('image')).toEqual([{ digest: DIGEST, tags: ['latest'] }]);
        expectOnlyTargetWrites(harbor);
    });

    it('independently verifies destination tags after copying, rather than trusting create responses', async () => {
        const harbor = createHarbor();

        harbor.setInterceptor((request, url) => (
            request.method === 'GET' && url.pathname.startsWith('/api/v2.0/projects/target/') && url.pathname.endsWith('/tags') ?
                { body: [] } : undefined
        ));
        await expect(migrateRegistryProjectArtifacts(harbor.client, 'source', 'target')).rejects.toThrow('Missing Harbor destination tag');
    });

    it.each(['repository', 'artifact', 'tag'])('rejects a changed source %s in the independent second snapshot', async (change) => {
        const harbor = createHarbor();
        let changed = false;

        harbor.setInterceptor((request, url) => {
            if (!changed && request.method === 'GET' && url.pathname.includes('/target/') && url.pathname.endsWith('/tags')) {
                changed = true;

                if (change === 'repository') {
                    harbor.source.set('new-repository', []);
                } else if (change === 'artifact') {
                    harbor.source.get('image')?.push({ digest: OTHER_DIGEST, tags: [] });
                } else {
                    harbor.source.get('image')?.[0].tags.push('new-tag');
                }
            }

            return undefined;
        });
        await expect(migrateRegistryProjectArtifacts(harbor.client, 'source', 'target')).rejects.toThrow('source inventory changed');
        expect(harbor.sourceSnapshots).toBe(2);
        expectOnlyTargetWrites(harbor);
    });

    it('copies ordinary child digests and recursively verifies hard accessory chains without copying them as roots', async () => {
        const accessoryDigests = Array.from({ length: 101 }, (_, index) => `sha256:${(index + 10).toString(16).padStart(64, '0')}`);
        const nestedAccessory = `sha256:${'c'.repeat(64)}`;
        const source: Repositories = new Map([['image', [
            {
                digest: DIGEST, 
                tags: ['index'], 
                references: [OTHER_DIGEST], 
                accessories: accessoryDigests, 
            },
            {
                digest: OTHER_DIGEST, 
                tags: ['child'], 
                child: true, 
            },
            ...accessoryDigests.map((digest, index) => ({
                digest, 
                tags: [], 
                hard: true, 
                accessories: index === 0 ? [nestedAccessory] : [], 
            })),
            {
                digest: nestedAccessory, 
                tags: [], 
                hard: true, 
            },
        ]]]);
        const harbor = createHarbor(source);

        await migrateRegistryProjectArtifacts(harbor.client, 'source', 'target');
        await migrateRegistryProjectArtifacts(harbor.client, 'source', 'target');

        expect(harbor.target.get('image')).toHaveLength(104);

        const copies = harbor.transport.requests.filter((request) => request.method === 'POST' && new URL(request.url).searchParams.has('from'));

        expect(copies.map((request) => new URL(request.url).searchParams.get('from'))).toEqual([
            `source/image@${DIGEST}`, 
            `source/image@${OTHER_DIGEST}`,
            `source/image@${DIGEST}`, 
            `source/image@${OTHER_DIGEST}`,
        ]);
        expect(harbor.transport.requests.some((request) => request.url.includes('/accessories?page=2'))).toBe(true);
        expectOnlyTargetWrites(harbor);
    });

    it('preflights all repositories and child/accessory tags before any auto-tagging copy', async () => {
        const source: Repositories = new Map([
            ['first', [{ digest: DIGEST, tags: [] }]],
            ['last', [
                {
                    digest: DIGEST, 
                    tags: [], 
                    accessories: [OTHER_DIGEST], 
                },
                {
                    digest: OTHER_DIGEST, 
                    tags: ['signature'], 
                    hard: true, 
                },
            ]],
        ]);
        const harbor = createHarbor(source);

        harbor.target.set('last', [{ digest: DIGEST, tags: ['signature'] }]);

        await expect(migrateRegistryProjectArtifacts(harbor.client, 'source', 'target')).rejects.toThrow('digest mismatch');
        expect(harbor.transport.requests.every((request) => request.method === 'GET')).toBe(true);
    });

    it.each(['association', 'reference', 'unsupported'])('fails closed on an invalid accessory/reference %s', async (failure) => {
        const harbor = createHarbor(new Map([['image', [
            {
                digest: DIGEST, 
                tags: [], 
                references: [OTHER_DIGEST], 
                accessories: [OTHER_DIGEST], 
            },
            {
                digest: OTHER_DIGEST, 
                tags: [], 
                hard: true, 
            },
        ]]]));

        harbor.setInterceptor((request, url) => {
            if (request.method !== 'GET') {
                return undefined;
            }

            if (failure === 'unsupported' && url.pathname.includes('/source/') && url.pathname.endsWith('/accessories')) {
                return { body: [{ digest: OTHER_DIGEST }] };
            }

            if (failure === 'association' && url.pathname.includes('/target/') && url.pathname.endsWith('/accessories')) {
                return { body: [] };
            }

            if (failure === 'reference' && url.pathname.includes(`/target/repositories/image/artifacts/${encodeURIComponent(DIGEST)}`) && !url.pathname.endsWith('/tags') && !url.pathname.endsWith('/accessories')) {
                return { body: { digest: DIGEST, references: [] } };
            }

            return undefined;
        });

        const messages: Record<string, string> = {
            unsupported: 'Unsupported Harbor accessory',
            reference: 'reference mismatch',
            association: 'Missing Harbor destination accessory',
        };

        await expect(migrateRegistryProjectArtifacts(harbor.client, 'source', 'target')).rejects.toThrow(messages[failure]);
        expectOnlyTargetWrites(harbor);
    });

    it('detects accessory graph changes in the second source snapshot', async () => {
        const harbor = createHarbor(new Map([['image', [
            {
                digest: DIGEST, 
                tags: [], 
                accessories: [], 
            },
            {
                digest: OTHER_DIGEST, 
                tags: [], 
                hard: true, 
            },
        ]]]));

        harbor.setInterceptor((request, url) => {
            if (request.method === 'GET' && url.pathname.includes('/target/') && url.pathname.endsWith('/accessories')) {
                const original = harbor.source.get('image')?.[0];

                if (original) {
                    original.accessories = [OTHER_DIGEST];
                }
            }

            return undefined;
        });

        await expect(migrateRegistryProjectArtifacts(harbor.client, 'source', 'target')).rejects.toThrow('source inventory changed');
        expect(harbor.sourceSnapshots).toBe(2);
    });

    it('handles an empty source without writes', async () => {
        const harbor = createHarbor(new Map());

        await migrateRegistryProjectArtifacts(harbor.client, 'source', 'target');
        expect(harbor.sourceSnapshots).toBe(2);
        expect(harbor.transport.requests.every((request) => request.method === 'GET')).toBe(true);
    });

    it('rejects copying a project onto itself without issuing any requests', async () => {
        const harbor = createHarbor();

        await expect(migrateRegistryProjectArtifacts(harbor.client, 'source', 'source')).rejects.toThrow('distinct');
        expect(harbor.transport.requests).toHaveLength(0);
    });
});
