/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isUUID } from '@authup/kit';
import { NotFoundError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { useRequestParam } from 'routup';
import type { Pack } from 'tar-stream';
import tar from 'tar-stream';
import { useDataSource } from 'typeorm-extension';
import { streamToBuffer, useMinio } from '../../../../core';
import {
    BucketEntity, BucketFileEntity, toBucketName,
} from '../../../../domains';

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

async function packFiles(
    pack: Pack,
    name: string,
    files: BucketFileEntity[],
) {
    const promises : Promise<void>[] = [];

    for (let i = 0; i < files.length; i++) {
        promises.push(packFile(pack, name, files[i]));
    }

    await Promise.all(promises);
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

    const pack = tar.pack();
    pack.pipe(res);

    await packFiles(pack, toBucketName(entity.id), files);

    pack.finalize();
}
