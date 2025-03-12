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
    applyRelations,
    useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { AnalysisNodeLogEntity } from '../../../../domains';

export async function getOneAnalysisNodeLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisNodeLogEntity);
    const query = repository.createQueryBuilder('log')
        .where('log.id = :id', { id });

    applyRelations(query, useRequestQuery(req, 'include'), {
        allowed: ['analysis', 'node'],
        defaultAlias: 'log',
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function getManyAnalysisLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisNodeLogEntity);
    const query = repository.createQueryBuilder('log');
    query.distinctOn(['log.id']);

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'log',
        filters: {
            allowed: [
                'error',
                'status',
                'analysis_id',
                'node_id',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: ['analysis', 'node'],
        },
        sort: {
            allowed: ['status', 'created_at', 'updated_at'],
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
