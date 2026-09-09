/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Readable } from 'node:stream';
import tar from 'tar-stream';
import { describe, expect, it } from 'vitest';
import { BucketFileEntity } from '../../../src/adapters/database/entities/bucket-file.ts';
import { packBucketFiles } from '../../../src/adapters/http/controllers/bucket/stream.ts';
import { FakeStorageAdapter } from '../core/entities/bucket/fake-storage.ts';

const BUCKET = 'bucket-1';

type Entry = {
    name: string, 
    type: string | undefined, 
    mode: number | undefined, 
    content: string 
};

function createFile(path: string, content: string): BucketFileEntity {
    const file = new BucketFileEntity();

    file.id = `id-${path}`;
    file.name = path.split('/').pop() as string;
    file.path = path;
    file.hash = `hash-${path}`;
    file.size = Buffer.byteLength(content);
    file.bucketId = BUCKET;

    return file;
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

async function pack(files: { path: string, content: string }[]): Promise<Entry[]> {
    const storage = new FakeStorageAdapter();
    storage.addBucket(BUCKET);

    const entities : BucketFileEntity[] = [];
    for (const file of files) {
        const entity = createFile(file.path, file.content);
        await storage.putObject(BUCKET, entity.hash, Buffer.from(file.content));
        entities.push(entity);
    }

    const webStream = packBucketFiles(BUCKET, entities, storage);

    return readEntries(Readable.fromWeb(webStream as never));
}

describe('adapters/bucket-stream', () => {
    it('should pack every file at its bucket path', async () => {
        const entries = await pack([
            { path: 'entrypoint.py', content: 'print(1)' },
            { path: 'sub/dir/helper.py', content: '# helper' },
        ]);

        expect(entries.map((entry) => entry.name)).toEqual(['entrypoint.py', 'sub/dir/helper.py']);
        expect(entries[0].content).toBe('print(1)');
        expect(entries[1].content).toBe('# helper');
    });

    it('should mark files readable and executable for everyone', async () => {
        // The analysis container runs as whatever user its master image
        // declares; tar-stream's default of 0o644 would leave that user unable
        // to execute the code it was handed.
        const entries = await pack([{ path: 'entrypoint.py', content: 'print(1)' }]);

        expect(entries[0].mode).toBe(0o755);
        expect(entries[0].mode).not.toBe(0o644);
    });

    it('should emit file entries only, so extraction cannot re-mode the target directory', async () => {
        // The worker extracts this into /opt/code, which it created world
        // writable. A directory entry here would carry its own mode and reset
        // that, silently, on the way in.
        const entries = await pack([
            { path: 'entrypoint.py', content: 'x' },
            { path: 'sub/dir/helper.py', content: 'y' },
        ]);

        for (const entry of entries) {
            expect(entry.type).toBe('file');
        }

        expect(entries.some((entry) => entry.name === './')).toBe(false);
    });

    it('should reject a file whose size was never recorded', async () => {
        const storage = new FakeStorageAdapter();
        storage.addBucket(BUCKET);

        const entity = createFile('entrypoint.py', 'x');
        entity.size = null;

        const webStream = packBucketFiles(BUCKET, [entity], storage);

        await expect(readEntries(Readable.fromWeb(webStream as never)))
            .rejects.toThrow('size is not recorded');
    });
});
