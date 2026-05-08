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
import type { Client } from 'minio';
import { streamToBuffer } from '../../../../core/utils/stream-to-buffer.ts';
import type { BucketFileEntity } from '../../../database/entities/bucket-file.ts';

async function packFile(
    pack: Pack,
    name: string,
    file: BucketFileEntity,
    minio: Client,
    logger?: Logger,
) : Promise<void> {
    return new Promise<void>((resolve, reject) => {
        minio.getObject(name, file.hash)
            .then((stream) => streamToBuffer(stream))
            .then((data) => {
                logger?.debug(`Packing file ${file.path} (${file.id})`);

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
            })
            .catch((e) => reject(e));
    });
}

export async function packBucketFiles(
    name: string,
    files: BucketFileEntity[],
    minio: Client,
    logger?: Logger,
) : Promise<Response> {
    const pack = tar.pack();

    const promise = files.reduce(
        (prev, file) => prev.then(() => packFile(pack, name, file, minio, logger)),
        Promise.resolve(),
    );

    promise
        .then(() => pack.finalize())
        .catch(() => pack.destroy());

    const readable = new Readable({
        highWaterMark: 16384,
        read() {},
    });

    pack.on('data', (chunk: Buffer) => readable.push(chunk));
    pack.on('end', () => readable.push(null));
    pack.on('error', (err: Error) => readable.destroy(err));

    const webStream = Readable.toWeb(readable) as ReadableStream;

    return new Response(webStream, {
        status: 200,
        headers: {
            'Content-Type': 'application/x-tar',
            'Transfer-Encoding': 'chunked',
        },
    });
}
