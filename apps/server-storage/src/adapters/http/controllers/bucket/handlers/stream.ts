/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isUUID } from '@authup/kit';
import { NotFoundError } from '@ebec/http';
import { useLogger } from '@privateaim/server-kit';
import type { Request, Response } from 'routup';
import { useRequestParam } from 'routup';
import type { Pack } from 'tar-stream';
import tar from 'tar-stream';
import type { DataSource } from 'typeorm';
import type { Client } from 'minio';
import { streamToBuffer } from '../../../../../core/utils/stream-to-buffer.ts';
import {
    toBucketName,
} from '../../../../../app/domains/bucket/utils.ts';
import { BucketEntity } from '../../../../database/entities/bucket.ts';
import { BucketFileEntity } from '../../../../database/entities/bucket-file.ts';

async function packFile(
    pack: Pack,
    name: string,
    file: BucketFileEntity,
    minio: Client,
) : Promise<void> {
    return new Promise<void>((resolve, reject) => {
        minio.getObject(name, file.hash)
            .then((stream) => streamToBuffer(stream))
            .then((data) => {
                useLogger().debug(`Packing file ${file.path} (${file.id})`);

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

async function streamFiles(
    res: Response,
    name: string,
    files: BucketFileEntity[],
    minio: Client,
) {
    return new Promise<void>((resolve, reject) => {
        const pack = tar.pack();
        pack.pipe(res);
        pack.on('error', (err) => {
            reject(err);
        });

        const promises : Promise<void>[] = [];

        for (const file of files) {
            promises.push(packFile(pack, name, file, minio));
        }

        Promise.resolve()
            .then(() => Promise.all(promises))
            .then(() => pack.finalize())
            .then(() => resolve())
            .catch((e) => reject(e));
    });
}

export async function executeBucketRouteStreamHandler(
    req: Request,
    res: Response,
    dataSource: DataSource,
    minio: Client,
) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const repository = dataSource.getRepository(BucketEntity);
    const query = repository.createQueryBuilder('bucket');
    if (isUUID(id)) {
        query.where('bucket.id = :id', { id });
    } else {
        query.where('bucket.name LIKE :name', { name: id });
    }
    const entity = await query.getOne();
    if (!entity) {
        throw new NotFoundError();
    }

    const fileRepository = dataSource.getRepository(BucketFileEntity);
    const files = await fileRepository.findBy({ bucket_id: entity.id });

    res.writeHead(200, {
        'Content-Type': 'application/x-tar',
        'Transfer-Encoding': 'chunked',
    });

    const bucketName = toBucketName(entity.id);

    useLogger().debug(`Streaming files of ${bucketName}`);

    try {
        await streamFiles(res, bucketName, files, minio);

        useLogger().debug(`Streamed files of ${bucketName}`);
    } catch (err) {
        useLogger().error(err);
    }
}
