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
import { useDataSource } from 'typeorm-extension';
import { streamToBuffer, useMinio } from '../../../../core/index.ts';
import {
    toBucketName,
} from '../../../../domains/index.ts';
import { BucketEntity, BucketFileEntity } from '../../../../database/index.ts';

async function packFile(
    pack: Pack,
    name: string,
    file: BucketFileEntity,
) : Promise<void> {
    const minio = useMinio();
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
) {
    return new Promise<void>((resolve, reject) => {
        const pack = tar.pack();
        pack.pipe(res);
        pack.on('error', (err) => {
            reject(err);
        });

        const promises : Promise<void>[] = [];

        for (let i = 0; i < files.length; i++) {
            promises.push(packFile(pack, name, files[i]));
        }

        Promise.resolve()
            .then(() => Promise.all(promises))
            .then(() => pack.finalize())
            .then(() => resolve())
            .catch((e) => reject(e));
    });
}

export async function executeBucketRouteStreamHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
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
    const files = await fileRepository.findBy({
        bucket_id: entity.id,
    });

    res.writeHead(200, {
        'Content-Type': 'application/x-tar',
        'Transfer-Encoding': 'chunked',
    });

    const bucketName = toBucketName(entity.id);

    useLogger().debug(`Streaming files of ${bucketName}`);

    try {
        await streamFiles(res, bucketName, files);

        useLogger().debug(`Streamed files of ${bucketName}`);
    } catch (err) {
        useLogger().error(err);
    }
}
