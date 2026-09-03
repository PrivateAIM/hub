/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createFakeClient as createFakeCoreClient } from '@privateaim/core-http-kit/testing';
import { createFakeClient as createFakeStorageClient } from '@privateaim/storage-kit/testing';
import { Readable } from 'node:stream';
import tar from 'tar-stream';
import { describe, expect, it } from 'vitest';
import { ANALYSIS_BUILD_CONTEXT_ARCHIVE } from '../../../../src/app/components/analysis-builder/constants.ts';
import type { DockerFileAnalysis } from '../../../../src/app/components/analysis-builder/helpers/index.ts';
import { createBuildContext, generateDockerFileContent } from '../../../../src/app/components/analysis-builder/helpers/index.ts';

type Entry = {
    name: string, 
    type: string | undefined, 
    mode: number | undefined, 
    content: Buffer 
};

async function readEntries(readable: Readable): Promise<Entry[]> {
    const extract = tar.extract();
    const output : Entry[] = [];

    extract.on('entry', (headers, stream, callback) => {
        const chunks : Buffer[] = [];
        stream.on('data', (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        stream.on('end', () => {
            output.push({
                name: headers.name,
                type: headers.type,
                mode: headers.mode,
                content: Buffer.concat(chunks),
            });
            callback();
        });
        stream.resume();
    });

    await new Promise<void>((resolve, reject) => {
        extract.on('finish', () => resolve());
        extract.on('error', (err) => reject(err));
        readable.on('error', (err) => reject(err));
        readable.pipe(extract);
    });

    return output;
}

function createClients(options: {
    command?: string,
    commandArguments?: { value: string, position?: 'before' | 'after' }[],
    directory?: string,
    fileName?: string,
    virtualPath?: string,
} = {}) {
    const coreClient = createFakeCoreClient({
        handlers: {
            'GET /analysis-buckets': () => ({ data: [{ id: 'bucket-1' }], meta: { total: 1 } }),
            'GET /analysis-bucket-files': () => ({
                data: [{ id: 'abf-1', bucketFileId: 'bf-1' }],
                meta: { total: 1 },
            }),
            'GET /master-images/:id': () => ({
                data: {
                    id: 'mi-1',
                    virtualPath: options.virtualPath ?? 'python/base',
                    command: options.command ?? 'python',
                    commandArguments: options.commandArguments ?? null,
                },
                meta: {},
            }),
        },
    });

    const storageClient = createFakeStorageClient({
        handlers: {
            'GET /bucket-files/:id': () => ({
                data: {
                    id: 'bf-1',
                    directory: options.directory ?? '',
                    name: options.fileName ?? 'entrypoint.py',
                },
                meta: {},
            }),
        },
    });

    return { coreClient, storageClient };
}

function createAnalysis(overrides: Partial<DockerFileAnalysis> = {}): DockerFileAnalysis {
    return {
        id: 'analysis-1',
        masterImageId: 'mi-1',
        imageCommandArguments: null,
        ...overrides,
    };
}

describe('analysis-builder/dockerfile', () => {
    it('should not create the code directory with RUN', async () => {
        // A RUN executes as the master image's USER, so it fails on any base
        // that drops privileges (e.g. `USER postgres` over a root-owned /opt).
        const content = await generateDockerFileContent(createAnalysis(), createClients());

        expect(content).not.toMatch(/RUN/);
        expect(content).not.toMatch(/mkdir/);
        expect(content).not.toMatch(/chmod/);
    });

    it('should extract the code directory from the build context archive', async () => {
        const content = await generateDockerFileContent(createAnalysis(), createClients());

        expect(content.split('\n')).toEqual([
            'FROM master/python/base',
            `ADD ${ANALYSIS_BUILD_CONTEXT_ARCHIVE} /opt/`,
            'CMD ["python", "/opt/code/entrypoint.py"]',
        ]);
    });

    it('should join the entrypoint directory into the CMD path', async () => {
        const content = await generateDockerFileContent(
            createAnalysis(),
            createClients({ directory: 'src/nested', fileName: 'main.py' }),
        );

        expect(content).toContain('CMD ["python", "/opt/code/src/nested/main.py"]');
    });

    it('should place command arguments around the entrypoint by position', async () => {
        const content = await generateDockerFileContent(createAnalysis(), createClients({
            commandArguments: [
                { value: '-u', position: 'before' },
                { value: '--verbose', position: 'after' },
                { value: '-B' },
            ],
        }));

        expect(content).toContain('CMD ["python", "-u", "-B", "/opt/code/entrypoint.py", "--verbose"]');
    });

    it('should prefer the analysis command arguments over the master image ones', async () => {
        const content = await generateDockerFileContent(
            createAnalysis({ imageCommandArguments: [{ value: '--from-analysis' }] }),
            createClients({ commandArguments: [{ value: '--from-master-image' }] }),
        );

        expect(content).toContain('--from-analysis');
        expect(content).not.toContain('--from-master-image');
    });
});

describe('analysis-builder/build-context', () => {
    it('should carry the path archive and the Dockerfile', async () => {
        const entries = await readEntries(await createBuildContext('FROM scratch'));

        expect(entries.map((entry) => entry.name)).toEqual([ANALYSIS_BUILD_CONTEXT_ARCHIVE, 'Dockerfile']);
        expect(entries[1].content.toString('utf-8')).toBe('FROM scratch');
    });

    it('should describe the code directory as world-writable and root owned', async () => {
        // Docker recreates the destination of a COPY/ADD *directory* with its
        // own defaults (root:root 0755) but preserves mode and ownership when
        // extracting a tar — which is the whole reason this archive exists.
        const [archive] = await readEntries(await createBuildContext('FROM scratch'));
        const [directory] = await readEntries(Readable.from(archive.content));

        expect(directory.name).toBe('code');
        expect(directory.type).toBe('directory');
        expect(directory.mode).toBe(0o777);
    });

    it('should encode the Dockerfile by byte length, not character count', async () => {
        const dockerfile = 'FROM scratch\n# äöü — mit Umlauten';
        const entries = await readEntries(await createBuildContext(dockerfile));

        expect(entries[1].content.toString('utf-8')).toBe(dockerfile);
    });
});
