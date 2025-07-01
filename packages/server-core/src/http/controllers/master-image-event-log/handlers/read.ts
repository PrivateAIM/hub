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
import { MasterImageEventLogEntity } from '../../../../database/domains';

export async function getOneMasterImageEventLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(MasterImageEventLogEntity);
    const query = repository.createQueryBuilder('log')
        .where('log.id = :id', { id });

    applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'log',
        relations: {
            allowed: [
                'master_image',
            ],
        },
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function getManyMasterImageEventLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(MasterImageEventLogEntity);
    const query = repository.createQueryBuilder('log');
    query.distinctOn(['log.id']);

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'log',
        filters: {
            allowed: [
                'name',
                'master_image_id',
                'created_at',
                'updated_at',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: [
                'master_image',
            ],
        },
        sort: {
            allowed: [
                'expires_at',
                'created_at',
                'updated_at',
            ],
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
