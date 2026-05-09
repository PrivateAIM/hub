/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Readable } from 'node:stream';
import type { Logger } from '@privateaim/server-kit';
import type { Pack } from 'tar-stream';
import tar from 'tar-stream';
import type { IStorageAdapter } from '../../../../core/storage/types.ts';
import { streamToBuffer } from '../../../../core/utils/stream-to-buffer.ts';
import type { BucketFileEntity } from '../../../database/entities/bucket-file.ts';

async function packFile(
    pack: Pack,
    name: string,
    file: BucketFileEntity,
    storage: IStorageAdapter,
    logger?: Logger,
) : Promise<void> {
    const stream = await storage.getObject(name, file.hash);
    const data = await streamToBuffer(stream);

    logger?.debug(`Packing file ${file.path} (${file.id})`);

    return new Promise<void>((resolve, reject) => {
        pack.entry({
            name: file.path,
            size: data.byteLength,
        }, data, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export function packBucketFiles(
    name: string,
    files: BucketFileEntity[],
    storage: IStorageAdapter,
    logger?: Logger,
) : ReadableStream {
    const pack = tar.pack();

    const promise = files.reduce(
        (prev, file) => prev.then(() => packFile(pack, name, file, storage, logger)),
        Promise.resolve(),
    );

    promise
        .then(() => pack.finalize())
        .catch(() => pack.destroy());

    // tar-stream's Pack doesn't set readableHighWaterMark which
    // Readable.toWeb() requires. Pipe through a wrapper that has it.
    const readable = new Readable({ highWaterMark: 16384, read() {} });
    pack.on('data', (chunk: Buffer) => readable.push(chunk));
    pack.on('end', () => readable.push(null));
    pack.on('error', (err: Error) => readable.destroy(err));

    return Readable.toWeb(readable) as ReadableStream;
}
