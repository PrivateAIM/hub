/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import { createFakeClient } from '@privateaim/core-http-kit/testing';
import { createFakeClient as createFakeStorageClient } from '@privateaim/storage-kit/testing';
import type { Client as DockerClient } from 'docken';
import type { Container } from 'dockerode';
import type { Headers } from 'tar-stream';
import tar from 'tar-stream';
import { describe, expect, it } from 'vitest';
import { AnalysisContainerPath } from '../../../../src/app/components/analysis-builder/constants';
import { AnalysisBuilderExecuteHandler } from '../../../../src/app/components/analysis-builder/handlers/execute/module';

// No docker daemon and no message bus: the HTTP boundaries are real clients on
// a `MemoryTransport`, and `container.putArchive` is a fake that drains the tar
// the handler produces so it can be asserted on.
//
// The rejection cases double as the regression net for `container-pack`'s entry
// stream: without its error listener a rejected entry raises an
// uncaughtException, which vitest reports as an unhandled error and exits 1 on —
// so it needs no assertion of its own, but do not "fix" a red run by silencing
// that channel.

const ANALYSIS_ID = '55555555-5555-5555-5555-555555555555';
const ANALYSIS_BUCKET_ID = '66666666-6666-6666-6666-666666666666';
const BUCKET_ID = '77777777-7777-7777-7777-777777777777';

const ENTRYPOINT = 'entrypoint.py';

type TarEntry = {
    name: string,
    body?: string,
    type?: Headers['type'],
    linkname?: string
};

function buildTar(entries: TarEntry[]): Promise<Buffer> {
    const pack = tar.pack();

    for (const entry of entries) {
        const body = entry.body ?? '';

        pack.entry({
            name: entry.name,
            type: entry.type,
            linkname: entry.linkname,
            size: entry.type === 'file' || !entry.type ? body.length : 0,
        }, body);
    }

    pack.finalize();

    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
        pack.on('data', (chunk) => {
            chunks.push(Buffer.from(chunk));
        });
        pack.on('error', reject);
        pack.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

/**
 * tar-stream can only WRITE the eight typeflags it knows, so the `null` type —
 * the one issue #1864 is about — has to be forged: overwrite the typeflag byte
 * of the first header block and re-checksum it. `toType()` maps every
 * unrecognised flag to `null`, and `pack.js` then re-types a null entry back to
 * a regular file on the way out, which is what makes skipping it dangerous.
 */
function forgeTypeflag(input: Buffer, typeflag: string): Buffer {
    const buffer = Buffer.from(input);

    buffer.write(typeflag, 156, 1, 'ascii');
    buffer.fill(' ', 148, 156);

    let checksum = 0;
    for (let i = 0; i < 512; i++) {
        checksum += buffer[i];
    }

    buffer.write(`${checksum.toString(8).padStart(6, '0')}\0 `, 148, 8, 'ascii');

    return buffer;
}

type FakeContainer = {
    container: Container,
    archives: { path: string, content: Buffer }[],
    /** The promise `putArchive` handed back — see the leak assertion below. */
    putArchive: () => Promise<void> | undefined
};

function createFakeContainer(): FakeContainer {
    const archives: { path: string, content: Buffer }[] = [];

    let putArchive : Promise<void> | undefined;

    const container = {
        putArchive: (pack: any, options: { path: string }) => {
            putArchive = (async () => {
                const chunks: Buffer[] = [];

                // Draining is not optional: `packDockerContainerWithTarStream`
                // writes into this stream, so a fake that never reads would
                // stall on backpressure. Iterating also REJECTS once the pack is
                // destroyed, which is how the error path settles — a real
                // `putArchive` is an in-flight HTTP request to the daemon.
                for await (const chunk of pack) {
                    chunks.push(Buffer.from(chunk));
                }

                archives.push({ path: options.path, content: Buffer.concat(chunks) });
            })();

            return putArchive;
        },
    };

    return {
        // `dockerode`'s Container is a concrete class, not a port, so the fake
        // cannot structurally satisfy it — the same cast the sibling specs make.
        container: container as unknown as Container,
        archives,
        putArchive: () => putArchive,
    };
}

/**
 * `packContainer` is protected. A subclass is the narrowest way to drive the
 * `validateEntry` guard without also needing a docker daemon for `buildImage`.
 */
class TestableAnalysisBuilderExecuteHandler extends AnalysisBuilderExecuteHandler {
    public packForTest(container: Container, analysis: Analysis) {
        return this.packContainer(container, analysis);
    }
}

function createHandler(bucketFilePaths: string[], body: BodyInit) {
    const coreClient = createFakeClient({
        handlers: {
            'GET /analysis-buckets': () => ({
                data: [{
                    id: ANALYSIS_BUCKET_ID,
                    type: AnalysisBucketType.CODE,
                    analysisId: ANALYSIS_ID,
                    bucketId: BUCKET_ID,
                }],
                meta: { total: 1 },
            }),
            'GET /analysis-bucket-files': () => ({
                data: bucketFilePaths.map((path, index) => ({
                    id: `${index}`,
                    path,
                    analysisBucketId: ANALYSIS_BUCKET_ID,
                })),
                meta: { total: bucketFilePaths.length },
            }),
        },
    });

    const storageClient = createFakeStorageClient({ handlers: { [`GET /buckets/${BUCKET_ID}/stream`]: () => new Response(body) } });

    return new TestableAnalysisBuilderExecuteHandler({
        coreClient,
        storageClient,
        // `packContainer` never touches the docker client — it only receives an
        // already-created container.
        docker: undefined as unknown as DockerClient,
    });
}

function packBody(body: BodyInit, bucketFilePaths: string[]) {
    const handler = createHandler(bucketFilePaths, body);
    const fake = createFakeContainer();

    const promise = handler.packForTest(fake.container, { id: ANALYSIS_ID } as Analysis);

    return {
        promise,
        archives: fake.archives,
        putArchive: fake.putArchive,
    };
}

async function pack(entries: TarEntry[], bucketFilePaths: string[], transform?: (input: Buffer) => Buffer) {
    const archive = await buildTar(entries);

    return packBody(new Uint8Array(transform ? transform(archive) : archive), bucketFilePaths);
}

/**
 * Decode a packed archive back into its entries. A name over 100 bytes is split
 * across ustar's `prefix` and `name` fields, so it is NOT contiguous in the raw
 * bytes — a substring assertion silently passes over exactly the shapes worth
 * asserting on.
 */
function readTar(buffer: Buffer): Promise<{ name: string, type: Headers['type'] }[]> {
    const extract = tar.extract();
    const entries: { name: string, type: Headers['type'] }[] = [];

    return new Promise((resolve, reject) => {
        extract.on('entry', (headers, stream, next) => {
            entries.push({ name: headers.name, type: headers.type });
            stream.on('end', next);
            stream.resume();
        });
        extract.on('error', reject);
        extract.on('finish', () => resolve(entries));
        extract.end(buffer);
    });
}

/**
 * A response body that hands over `chunks` and then stalls or fails, standing in
 * for the storage download. `cancelled` flips when the consumer closes it, which
 * is the only observable proof that the source readable was destroyed.
 */
function createOpenBody(chunks: Uint8Array[], error?: Error) {
    const state = { cancelled: false };

    const body = new ReadableStream<Uint8Array>({
        start: (controller) => {
            for (const chunk of chunks) {
                controller.enqueue(chunk);
            }

            if (error) {
                controller.error(error);
            }
        },
        cancel: () => {
            state.cancelled = true;
        },
    });

    return { body, state };
}

describe('AnalysisBuilderExecuteHandler > packContainer', () => {
    it('should pack a bucket file that belongs to the analysis', async () => {
        const { promise, archives } = await pack(
            [{
                name: ENTRYPOINT,
                type: 'file',
                body: 'print(1)',
            }],
            [ENTRYPOINT],
        );

        await expect(promise).resolves.toBeUndefined();

        expect(archives).toHaveLength(1);
        expect(archives[0].path).toBe(AnalysisContainerPath.CODE);
        expect(archives[0].content.includes(ENTRYPOINT)).toBe(true);
    });

    it('should pack the bucket-file paths the storage service really produces', async () => {
        // The no-false-positives half of the allow-list. `packBucketFiles` calls
        // `pack.entry({ name, size })` with no `type`, so tar-stream derives
        // `'file'` — but the derivation runs through the header encoder, and a
        // name over 100 bytes takes the pax path with a header of its own. These
        // are real shapes: the uploader sends `webkitRelativePath` verbatim, so
        // deep and non-ASCII paths are the norm, not the edge.
        const paths = [
            'entrypoint.py',
            'mycode/sub/dir/util.py',
            `${'a/'.repeat(60)}deep.py`,
            'Ordner/Grüße_日本語_файл.py',
            'empty.py',
        ];

        const { promise, archives } = await pack(
            paths.map((name) => ({
                name,
                type: undefined,
                body: name === 'empty.py' ? '' : 'x',
            })),
            paths,
        );

        await expect(promise).resolves.toBeUndefined();

        expect(archives).toHaveLength(1);

        // Assert on the decoded entries, not on "it resolved" — otherwise this
        // passes just as happily for an empty tar. The types are the point: the
        // producer never sets one, so every entry here reached the allow-list as
        // `'file'` and was let through.
        const entries = await readTar(archives[0].content);

        expect(entries.map((entry) => entry.name)).toEqual(paths);
        expect(entries.every((entry) => entry.type === 'file')).toBe(true);
    });

    it('should reject a file that does not belong to the analysis', async () => {
        const { promise, putArchive } = await pack(
            [{
                name: 'evil.py',
                type: 'file',
                body: 'print(1)',
            }],
            [ENTRYPOINT],
        );

        await expect(promise).rejects.toThrow('is not a valid analysis bucket file');

        // The rejected pack must also be destroyed. `putArchive` is already
        // consuming it — leaving it open holds an HTTP request to the docker
        // daemon for the lifetime of the worker, once per failed build.
        await expect(putArchive()).rejects.toThrow();
    });

    it('should reject a symlink entry', async () => {
        const { promise } = await pack(
            [{
                name: ENTRYPOINT,
                type: 'symlink',
                linkname: '/etc/passwd',
            }],
            [ENTRYPOINT],
        );

        await expect(promise).rejects.toThrow('Unsupported tar entry type');
    });

    it('should reject a directory entry', async () => {
        const { promise } = await pack(
            [{ name: 'code', type: 'directory' }],
            [ENTRYPOINT],
        );

        await expect(promise).rejects.toThrow('Unsupported tar entry type');
    });

    it('should reject an entry whose typeflag tar-stream does not recognise', async () => {
        // Decodes as `type: null` and would be re-encoded as a regular FILE by
        // `pack.js` — so skipping it lets an unlisted file into the container.
        const { promise } = await pack(
            [{
                name: 'evil.py',
                type: 'file',
                body: 'print(1)',
            }],
            [ENTRYPOINT],
            (archive) => forgeTypeflag(archive, 'V'),
        );

        await expect(promise).rejects.toThrow('Unsupported tar entry type');
    });

    it('should close the storage download when an entry is rejected', async () => {
        const archive = await buildTar([{
            name: 'evil.py',
            type: 'file',
            body: 'print(1)',
        }]);

        // The real download is a long-lived HTTP body. Nothing ends it on the
        // reject path unless the packer destroys it, and an abandoned reader
        // holds the connection open for one storage timeout per failed build.
        const { body, state } = createOpenBody([new Uint8Array(archive)]);

        const { promise } = packBody(body, [ENTRYPOINT]);

        await expect(promise).rejects.toThrow('is not a valid analysis bucket file');

        expect(state.cancelled).toBe(true);
    });

    it('should settle putArchive when the storage download fails mid-stream', async () => {
        const archive = await buildTar([{
            name: ENTRYPOINT,
            type: 'file',
            body: 'print(1)',
        }]);

        // `readable.pipe(extract)` does NOT forward a source error to the
        // destination, so the extract never finishes and the pack is never
        // finalized. `putArchive` would then hold its request open forever —
        // and the caller's `container.remove({ force: true })` blocks behind it.
        const { body } = createOpenBody(
            [new Uint8Array(archive.subarray(0, 512))],
            new Error('storage stream aborted'),
        );

        const { promise, putArchive } = packBody(body, [ENTRYPOINT]);

        await expect(promise).rejects.toThrow('storage stream aborted');
        await expect(putArchive()).rejects.toThrow();
    });

    it('should settle putArchive on a corrupt archive', async () => {
        // Not a tar at all — a proxy error page, or a download corrupted before
        // the first header. The extract raises inside `_consumeHeader`, so no
        // entry is ever emitted and no entry sink exists to tear the pack down
        // incidentally: the extract's own error handler is the only thing that
        // can end it.
        const { body, state } = createOpenBody([new Uint8Array(Buffer.alloc(512, 0x41))]);

        const { promise, putArchive } = packBody(body, [ENTRYPOINT]);

        await expect(promise).rejects.toThrow();
        await expect(putArchive()).rejects.toThrow();

        expect(state.cancelled).toBe(true);
    });

    it('should settle putArchive on a truncated archive', async () => {
        // Truncated mid-body: the extract raises, tar-stream destroys the entry
        // stream, and the packer destroys the pack sink. Every one of those
        // needs a listener, or streamx turns it into an uncaughtException that
        // takes the worker down before the caller can remove its container.
        const { promise, putArchive } = await pack(
            [{
                name: ENTRYPOINT,
                type: 'file',
                body: 'print(1)',
            }],
            [ENTRYPOINT],
            (archive) => archive.subarray(0, 512 + 4),
        );

        await expect(promise).rejects.toThrow();
        await expect(putArchive()).rejects.toThrow();
    });
});
