/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { useRequestParam } from 'routup';
import type { Pack } from 'tar-stream';
import tar from 'tar-stream';
import { useDataSource } from 'typeorm-extension';
import { streamToBuffer, useMinio } from '../../../../core';
import {
    BucketFileEntity,
} from '../../../../domains';

async function packFile(
    pack: Pack,
    file: BucketFileEntity,
) : Promise<void> {
    const minio = useMinio();
    return new Promise<void>((resolve, reject) => {
        minio.getObject(file.bucket.name, file.hash)
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

export async function executeBucketFileRouteStreamHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(BucketFileEntity);
    const entity = await repository.findOne({
        where: {
            id,
        },
        relations: ['bucket'],
    });

    if (!entity) {
        throw new NotFoundError();
    }

    res.writeHead(200, {
        'Content-Type': 'application/x-tar',
        'Transfer-Encoding': 'chunked',
    });

    const pack = tar.pack();
    pack.pipe(res);

    await packFile(pack, entity);

    pack.finalize();
}
