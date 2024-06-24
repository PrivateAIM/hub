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
import { isRealmResourceReadable } from '@authup/core-kit';
import { useRequestEnv } from '@privateaim/server-http-kit';
import { AnalysisPermissionEntity, onlyRealmWritableQueryResources } from '../../../../../domains';

export async function getOneAnalysisPermissionRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisPermissionEntity);
    const query = repository.createQueryBuilder('analysisPermission')
        .where('analysisPermission.id = :id', { id });

    applyRelations(query, useRequestQuery(req, 'include'), {
        allowed: ['analysis'],
        defaultAlias: 'analysisPermission',
    });

    const entity = await query.getOne();
    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceReadable(useRequestEnv(req, 'realm'), entity.analysis_realm_id)) {
        throw new ForbiddenError();
    }

    return send(res, entity);
}

export async function getManyAnalysisPermissionRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisPermissionEntity);
    const query = repository.createQueryBuilder('analysisPermission');
    query.distinctOn(['analysisPermission.id']);

    onlyRealmWritableQueryResources(query, useRequestEnv(req, 'realm'), [
        'analysisPermission.analysis_realm_id',
    ]);

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'analysisPermission',
        filters: {
            allowed: [
                'permission_id',
                'permission_realm_id',

                'analysis_id',
                'analysis_realm_id',
                'analysis.id',
                'analysis.name',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: ['analysis'],
        },
        sort: {
            allowed: ['created_at', 'updated_at'],
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
