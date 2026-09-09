/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Readable } from 'node:stream';
import type { Headers } from 'tar-stream';
import tar from 'tar-stream';
import { describe, expect, it } from 'vitest';
import { packDockerContainerWithTarStream } from '../../../src/adapters/docker/index.ts';
import { FakeContainerPackTarget } from './fake-pack-target.ts';

type Entry = {
    name: string, 
    type: Headers['type'], 
    mode: number | undefined, 
    content: string 
};

function buildStream(entries: {
    name: string, 
    content?: string, 
    type?: Headers['type'], 
    mode?: number 
}[]): Readable {
    const pack = tar.pack();

    for (const entry of entries) {
        if (entry.type === 'directory') {
            pack.entry({
                name: entry.name, 
                type: 'directory', 
                mode: entry.mode, 
            }, Buffer.alloc(0));
            continue;
        }

        pack.entry({ name: entry.name, mode: entry.mode }, Buffer.from(entry.content ?? ''));
    }

    pack.finalize();

    return pack;
}

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
                content: Buffer.concat(chunks).toString('utf-8'),
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

async function pack(entries: Parameters<typeof buildStream>[0], path = '/opt/code/') {
    const target = new FakeContainerPackTarget();
    await packDockerContainerWithTarStream(target, buildStream(entries), { path });

    return { target, entries: await readEntries(target.archive()) };
}

describe('docker/container-pack: directory synthesis', () => {
    // The incoming stream carries FILE entries only (server-storage's
    // packBucketFiles emits nothing else), so without this docker's extractor
    // materializes every parent itself at root:root 0755 — and an analysis
    // running as a non-root master image user cannot write into its own tree.
    it('should synthesize a world-writable directory for every parent', async () => {
        const { entries } = await pack([
            { name: 'entrypoint.py', content: 'print(1)' },
            { name: 'sub/dir/helper.py', content: '# helper' },
        ]);

        expect(entries.map((entry) => entry.name)).toEqual([
            'entrypoint.py',
            'sub/',
            'sub/dir/',
            'sub/dir/helper.py',
        ]);

        const directories = entries.filter((entry) => entry.type === 'directory');
        expect(directories).toHaveLength(2);
        for (const directory of directories) {
            expect(directory.mode).toBe(0o777);
        }
    });

    it('should emit outermost parents first', async () => {
        const { entries } = await pack([{ name: 'a/b/c/deep.py', content: 'x' }]);

        expect(entries.map((entry) => entry.name)).toEqual([
            'a/', 
            'a/b/', 
            'a/b/c/', 
            'a/b/c/deep.py',
        ]);
    });

    it('should emit each parent exactly once across sibling files', async () => {
        const { entries } = await pack([
            { name: 'sub/one.py', content: '1' },
            { name: 'sub/two.py', content: '2' },
            { name: 'sub/nested/three.py', content: '3' },
        ]);

        expect(entries.filter((entry) => entry.name === 'sub/')).toHaveLength(1);
        expect(entries.map((entry) => entry.name)).toEqual([
            'sub/',
            'sub/one.py',
            'sub/two.py',
            'sub/nested/',
            'sub/nested/three.py',
        ]);
    });

    it('should force an incoming directory entry to be world-writable, and not duplicate it', async () => {
        const { entries } = await pack([
            {
                name: 'sub/', 
                type: 'directory', 
                mode: 0o755, 
            },
            { name: 'sub/file.py', content: 'x' },
        ]);

        expect(entries.map((entry) => entry.name)).toEqual(['sub/', 'sub/file.py']);
        expect(entries[0].mode).toBe(0o777);
    });

    it('should pass file entries through unchanged', async () => {
        const { entries } = await pack([{
            name: 'sub/entrypoint.py', 
            content: 'print("hello")', 
            mode: 0o755, 
        }]);

        const file = entries.find((entry) => entry.name === 'sub/entrypoint.py');
        expect(file).toBeDefined();
        expect(file?.mode).toBe(0o755);
        expect(file?.content).toBe('print("hello")');
    });

    it('should forward the extraction path to the container', async () => {
        const { target } = await pack([{ name: 'entrypoint.py', content: 'x' }]);

        expect(target.calls).toHaveLength(1);
        expect(target.calls[0].path).toBe('/opt/code/');
    });

    it('should reject when an entry fails validation', async () => {
        const target = new FakeContainerPackTarget();

        await expect(packDockerContainerWithTarStream(
            target,
            buildStream([{ name: 'evil.py', content: 'x' }]),
            {
                path: '/opt/code/',
                validateEntry: (entry) => {
                    throw new Error(`rejected ${entry.name}`);
                },
            },
        )).rejects.toThrow('rejected evil.py');
    });

    it('should release the outgoing archive when an entry is rejected', async () => {
        // putArchive is already streaming the pack as its request body. Leaving
        // it neither finalized nor destroyed keeps that request open until the
        // daemon times it out, once per rejected build.
        const target = new FakeContainerPackTarget();

        await expect(packDockerContainerWithTarStream(
            target,
            buildStream([{ name: 'evil.py', content: 'x' }]),
            {
                path: '/opt/code/',
                validateEntry: () => {
                    throw new Error('rejected');
                },
            },
        )).rejects.toThrow('rejected');

        const pending = Symbol('pending');
        const settled = await Promise.race([
            target.completion?.then(() => 'resolved').catch(() => 'rejected'),
            new Promise((resolve) => {
                setTimeout(() => resolve(pending), 250);
            }),
        ]);

        expect(settled).not.toBe(pending);
    });
});
