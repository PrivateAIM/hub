/*
 * Copyright (c) 2022-2024.
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
import { BucketEntity } from '../../../../domains';

export async function executeBucketRouteGetOneHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(BucketEntity);
    const query = repository.createQueryBuilder('bucket')
        .where('bucket.id = :id', { id });

    applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'bucket',
        fields: {
            default: [
                'id',
                'name',
                'region',
                'created_at',
                'updated_at',
                'realm_id',
                'robot_id',
                'user_id',
            ],
        },
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function executeBucketRouteGetManyHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();

    const repository = dataSource.getRepository(BucketEntity);
    const query = repository.createQueryBuilder('bucket');

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'bucket',
        fields: {
            default: [
                'id',
                'name',
                'region',
                'created_at',
                'updated_at',
                'realm_id',
                'robot_id',
                'user_id',
            ],
        },
        filters: {
            allowed: ['id', 'name', 'realm_id', 'user_id', 'robot_id'],
        },
        pagination: {
            maxLimit: 50,
        },
        sort: {
            allowed: ['id', 'updated_at', 'created_at'],
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
