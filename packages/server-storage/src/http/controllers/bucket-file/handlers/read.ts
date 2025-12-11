/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send, useRequestParam } from 'routup';
import {
    applyQuery,
    useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { BucketFileEntity } from '../../../../database';

export async function executeBucketFileRouteGetOneHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(BucketFileEntity);
    const query = repository.createQueryBuilder('bucketFile')
        .where('bucketFile.id = :id', { id });

    applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'bucketFile',
        fields: {
            default: [
                'id',
                'name',
                'path',
                'directory',
                'size',
                'hash',
                'created_at',
                'updated_at',
                'realm_id',
                'actor_type',
                'actor_id',
                'bucket_id',
            ],
        },
        relations: {
            allowed: ['bucket'],
        },
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function executeBucketFileRouteGetManyHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();

    const repository = dataSource.getRepository(BucketFileEntity);
    const query = repository.createQueryBuilder('bucketFile');

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'bucketFile',
        fields: {
            default: [
                'id',
                'name',
                'path',
                'directory',
                'size',
                'hash',
                'created_at',
                'updated_at',
                'realm_id',
                'actor_type',
                'actor_id',
                'bucket_id',
            ],
        },
        relations: {
            allowed: ['bucket'],
        },
        filters: {
            allowed: [
                'id',
                'name',
                'directory',
                'realm_id',
                'actor_type',
                'actor_id',
                'bucket_id',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        sort: {
            allowed: ['id', 'directory', 'name', 'updated_at', 'created_at'],
        },
    });

    const [entities, total] = await query.getManyAndCount();

    return send(res, {
        data: entities,
        meta: {
            total,
            ...pagination,
        },
    });
}
