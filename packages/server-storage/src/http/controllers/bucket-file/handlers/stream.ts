/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useMinio } from '../../../../core';
import {
    BucketFileEntity,
} from '../../../../domains';

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
        'Content-Type': 'application/gzip',
    });

    // todo: this should work
    // setResponseHeaderAttachment(res, entity.path);

    const minio = useMinio();
    const stream = await minio.getObject(entity.bucket.name, entity.hash);

    stream.pipe(res);
}
