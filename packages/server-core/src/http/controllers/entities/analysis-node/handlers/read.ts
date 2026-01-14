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
    applyQuery, applyRelations, useDataSource,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceReadable } from '@privateaim/kit';
import { useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { AnalysisNodeEntity, onlyRealmWritableQueryResources } from '../../../../../database/index.ts';

export async function getOneAnalysisNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisNodeEntity);
    const query = repository.createQueryBuilder('analysisNode')
        .where('analysisNode.id = :id', { id });

    applyRelations(query, useRequestQuery(req, 'include'), {
        allowed: ['node', 'analysis'],
        defaultAlias: 'analysisNode',
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    if (
        !isRealmResourceReadable(useRequestIdentityRealm(req), entity.analysis_realm_id) &&
        !isRealmResourceReadable(useRequestIdentityRealm(req), entity.node_realm_id)
    ) {
        throw new ForbiddenError();
    }

    return send(res, entity);
}

export async function getManyAnalysisNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisNodeEntity);
    const query = repository.createQueryBuilder('analysisNode');
    query.distinctOn(['analysisNode.id']);

    onlyRealmWritableQueryResources(query, useRequestIdentityRealm(req), [
        'analysisNode.analysis_realm_id',
        'analysisNode.node_realm_id',
    ]);

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'analysisNode',
        filters: {
            allowed: [
                'execution_status',

                'approval_status',

                'analysis_id',
                'analysis_realm_id',
                'analysis.id',
                'analysis.name',
                'analysis.project_id',

                'node_id',
                'node_realm_id',
                'node.name',
                'node.realm_id',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: ['node', 'analysis'],
        },
        sort: {
            allowed: [
                'created_at',
                'updated_at',
                'analysis.name',
                'analysis.created_at',
                'analysis.updated_at',
                'node.name',
                'node.created_at',
                'node.updated_at',
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
