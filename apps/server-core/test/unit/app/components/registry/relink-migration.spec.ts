/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HarborClient } from '@hapic/harbor';
import type { Robot } from '@hapic/harbor';
import { createFakeAuthupClient } from '@privateaim/server-test-kit';
import { MemoryTransport } from 'hapic';
import type { MemoryResponseInit, TransportRequest } from 'hapic';
import { describe, expect, it } from 'vitest';
import { RegistryProjectMigration } from '../../../../../src/app/components/registry/handlers/project/relink/migration.ts';
import { buildRegistryProjectMigrationRobotName, parseRegistryProjectMigrationMarker } from '../../../../../src/app/components/registry/handlers/project/relink/marker.ts';
import type { RegistryProjectMigrationMarker, RegistryProjectRelinkSource } from '../../../../../src/app/components/registry/handlers/project/relink/types.ts';

const source: RegistryProjectRelinkSource = {
    project: {
        id: 'project',
        registryId: 'registry',
        name: 'node',
        type: 'node',
        public: false,
        externalName: 'source',
        externalId: '10',
        accountId: '20',
        accountName: 'old-robot',
        accountSecret: 'old-secret',
        realmId: 'realm',
        realm: undefined,
        registry: undefined,
        createdAt: '',
        updatedAt: '',
    },
    registry: {
        id: 'registry', 
        name: 'registry', 
        host: 'https://registry.example', 
        accountName: 'admin', 
        accountSecret: 'password', 
        createdAt: '', 
        updatedAt: '', 
    },
};

const marker: RegistryProjectMigrationMarker = {
    kind: 'privateaim-registry-project-migration',
    version: 1,
    registryId: 'registry',
    registryProjectId: 'project',
    sourceExternalName: 'source',
    sourceExternalId: '10',
    targetExternalName: 'target',
    targetExternalId: '11',
};

function createHarbor() {
    let targetExists = false;
    let fail = '';
    let pullDenied = false;
    let robots: Robot[] = [];
    const requests: TransportRequest[] = [];
    const connections: string[] = [];
    const transport = new MemoryTransport({
        fetch: (request): MemoryResponseInit => {
            requests.push(request);

            const path = new URL(request.url).pathname.replace('/api/v2.0/', '');
            const { method } = request;

            if (`${method} ${path}` === fail) {
                return { status: 403, body: { errors: [{ code: 'DENIED', message: 'denied' }] } };
            }

            if (method === 'GET' && path === 'projects/source') {
                return { status: 200, body: { name: 'source', project_id: 10 } };
            }

            if (method === 'GET' && path === 'projects/target') {
                return targetExists ? { status: 200, body: { name: 'target', project_id: 11 } } : { status: 404 };
            }

            if (method === 'POST' && path === 'projects') {
                targetExists = true;

                return { status: 201 };
            }

            if (method === 'POST' && path === 'robots') {
                const payload = JSON.parse(String(request.body));
                const robot = {
                    ...payload, 
                    id: 21, 
                    name: `robot$${payload.name}`, 
                    secret: 'new-secret', 
                };

                robots.push(robot);

                return { status: 201, body: robot };
            }

            if (method === 'GET' && path === 'robots') {
                return { status: 200, body: robots };
            }

            if (method === 'GET' && path === 'robots/21') {
                return { status: 200, body: robots[0] };
            }

            if (method === 'PUT' && path === 'robots/21') {
                robots[0] = JSON.parse(String(request.body));

                return { status: 200 };
            }

            if (method === 'PATCH' && path === 'robots/21') {
                return { status: 200, body: { secret: 'rotated' } };
            }

            if (method === 'GET' && /projects\/(source|target)\/repositories$/.test(path)) {
                return { status: 200, body: [] };
            }

            if (method === 'GET' && path === 'projects/target/webhook/policies') {
                return { status: 200, body: [] };
            }

            if (method === 'POST' && path === 'projects/target/webhook/policies') {
                return { status: 201 };
            }

            throw new Error(`Unexpected Harbor operation: ${method} ${path}`);
        },
    });
    const client = new HarborClient({ request: { baseURL: 'https://harbor.test/api/v2.0/', transport } });
    const authupClient = createFakeAuthupClient({ fallback: () => ({ data: { id: 'service-id', secret: 'service-secret' } }) });
    const migration = new RegistryProjectMigration({
        publicURL: 'https://hub.test/', 
        authupClient, 
        createClient: (connectionString) => {
            connections.push(connectionString);

            if (connectionString.startsWith('robot$')) {
                return new HarborClient({
                    request: {
                        baseURL: 'https://harbor.test/api/v2.0/',
                        transport: new MemoryTransport({
                            fetch: (request) => {
                                requests.push(request);

                                if (pullDenied) {
                                    return { status: 403 };
                                }

                                const path = new URL(request.url).pathname;

                                if (path.endsWith('/projects/target')) {
                                    return { status: 200, body: { project_id: 11 } };
                                }

                                if (path.endsWith('/repositories')) {
                                    return { status: 200, body: [{ name: 'target/nested/image' }] };
                                }

                                if (path === '/api/v2.0/projects/target/repositories/nested%252Fimage/artifacts') {
                                    return { status: 200, body: [] };
                                }

                                throw new Error(`Unexpected destination robot request: ${path}`);
                            }, 
                        }),
                    }, 
                });
            }

            return client; 
        }, 
    });

    return {
        migration,
        requests,
        connections,
        existing: (description?: string) => {
            targetExists = true;
            robots = description ? [{
                id: 21, 
                name: `robot$${buildRegistryProjectMigrationRobotName(source.project.id, 'target')}`, 
                description, 
            }] : [];
        },
        fail: (operation: string) => {
            fail = operation;
        },
        denyPull: () => {
            pullDenied = true; 
        },
    };
}

describe('RegistryProjectMigration (real Harbor APIs, memory transport)', () => {
    it('creates an owned target pull robot without changing/deleting the source', async () => {
        const { migration, requests } = createHarbor();
        const target = await migration.prepare(source, 'target');

        expect(target).toMatchObject({
            externalName: 'target', 
            externalId: '11', 
            accountId: '21', 
            accountSecret: 'new-secret', 
        });

        const robotRequest = requests.find((request) => request.method === 'POST' && new URL(request.url).pathname.endsWith('/robots'))!;
        const robot = JSON.parse(String(robotRequest.body));

        expect(parseRegistryProjectMigrationMarker(robot.description)).toEqual(marker);
        expect(robot.permissions).toEqual([expect.objectContaining({ namespace: 'target' })]);
        expect(requests.some((request) => request.method === 'DELETE')).toBe(false);
        expect(source.project.accountSecret).toBe('old-secret');
        expect(requests.some((request) => request.method !== 'GET' && new URL(request.url).pathname.includes('/source'))).toBe(false);
    });

    it('refuses an existing unowned destination without changing any remote object', async () => {
        const {
            migration, 
            requests, 
            existing, 
        } = createHarbor();

        existing();
        await expect(migration.prepare(source, 'target')).rejects.toThrow('not verifiably owned');
        expect(requests.every((request) => request.method === 'GET')).toBe(true);
    });

    it.each([
        { ...marker, targetExternalId: 'wrong' },
        { ...marker, sourceExternalId: 'wrong' },
        { ...marker, registryProjectId: 'another-owner' },
    ])('refuses a destination marker belonging to a different source/target/owner', async (wrongMarker) => {
        const {
            migration, 
            existing, 
            requests, 
        } = createHarbor();

        existing(JSON.stringify(wrongMarker));
        await expect(migration.prepare(source, 'target')).rejects.toThrow('not verifiably owned');
        expect(requests.every((request) => request.method === 'GET')).toBe(true);
    });

    it('retries only an owned target and rotates that target robot, never the source robot', async () => {
        const {
            migration, 
            existing, 
            requests, 
        } = createHarbor();

        existing(JSON.stringify(marker));

        const target = await migration.prepare(source, 'target');

        expect(target.accountSecret).toBe('rotated');
        expect(requests.filter((request) => request.method !== 'GET').map((request) => `${request.method} ${new URL(request.url).pathname}`)).toEqual(['PUT /api/v2.0/robots/21', 'PATCH /api/v2.0/robots/21']);
    });

    it('fails closed after a robot creation failure leaves an unowned project', async () => {
        const { migration, fail } = createHarbor();

        fail('POST robots');
        await expect(migration.prepare(source, 'target')).rejects.toThrow();
        fail('');
        await expect(migration.prepare(source, 'target')).rejects.toThrow('not verifiably owned');
    });

    it('verifies copied destination inventory with the new robot credentials', async () => {
        const { migration, connections } = createHarbor();
        const target = await migration.prepare(source, 'target');

        await migration.copy(source, target);
        expect(connections.at(-1)).toContain(`${target.accountName}:${target.accountSecret}@`);
    });

    it('does not accept unusable destination robot credentials', async () => {
        const { migration, denyPull } = createHarbor();
        const target = await migration.prepare(source, 'target');

        denyPull();
        await expect(migration.copy(source, target)).rejects.toThrow();
    });

    it('requires webhook write success rather than swallowing Harbor errors', async () => {
        const {
            migration, 
            fail, 
            requests, 
        } = createHarbor();
        const target = await migration.prepare(source, 'target');

        fail('POST projects/target/webhook/policies');
        await expect(migration.configureWebhook(source, target)).rejects.toThrow();
        expect(requests.some((request) => request.method === 'DELETE')).toBe(false);
    });

    it('fails if the stored source id no longer identifies the remote source', async () => {
        const { migration, requests } = createHarbor();

        await expect(migration.prepare({ ...source, project: { ...source.project, externalId: 'stale' } }, 'target')).rejects.toThrow('stored id');
        expect(requests).toHaveLength(1);
    });
});
