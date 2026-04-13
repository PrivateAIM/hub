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
import { AnalysisNodeEventEntity } from '../../../../../database/index.ts';

export async function getOneAnalysisNodeEventRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisNodeEventEntity);
    const query = repository.createQueryBuilder('e')
        .where('e.id = :id', { id })
        .groupBy('e.id');

    applyRelations(query, useRequestQuery(req, 'include'), {
        allowed: ['analysis', 'node'],
        defaultAlias: 'e',
        onJoin: (_property, key, query) => {
            query.addGroupBy(`${key}.id`);
        },
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function getManyAnalysisNodeEventRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisNodeEventEntity);
    const query = repository.createQueryBuilder('e');
    query.groupBy('e.id');

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'e',
        filters: {
            allowed: [
                'analysis_id',
                'node_id',
            ],
        },
        pagination: { maxLimit: 50 },
        relations: {
            allowed: ['analysis', 'node'],
            onJoin: (_property, key, query) => {
                query.addGroupBy(`${key}.id`);
            },
        },
        sort: {
            allowed: [
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
