/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import type { Response } from 'routup';
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
    res: Response,
    name: string,
    files: BucketFileEntity[],
    minio: Client,
    logger?: Logger,
) {
    return new Promise<void>((resolve, reject) => {
        const pack = tar.pack();
        pack.pipe(res);
        pack.on('error', (err) => {
            reject(err);
        });

        files.reduce(
            (prev, file) => prev.then(() => packFile(pack, name, file, minio, logger)),
            Promise.resolve(),
        )
            .then(() => pack.finalize())
            .then(() => resolve())
            .catch((e) => reject(e));
    });
}
