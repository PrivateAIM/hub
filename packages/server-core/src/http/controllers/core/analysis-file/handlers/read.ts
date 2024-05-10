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
import { AnalysisFileEntity, onlyRealmWritableQueryResources } from '../../../../../domains';
import { useRequestEnv } from '../../../../request';

export async function getOneAnalysisFileRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisFileEntity);
    const query = repository.createQueryBuilder('analysisFile')
        .where('analysisFile.id = :id', { id });

    applyRelations(query, useRequestQuery(req, 'include'), {
        allowed: ['analysis'],
        defaultAlias: 'analysisFile',
    });

    const entity = await query.getOne();

    if (
        !isRealmResourceReadable(useRequestEnv(req, 'realm'), entity.realm_id) &&
        !isRealmResourceReadable(useRequestEnv(req, 'realm'), entity.target_realm_id)
    ) {
        throw new ForbiddenError();
    }

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function getManyAnalysisFileRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisFileEntity);
    const query = repository.createQueryBuilder('analysisFile');
    query.distinctOn(['analysisFile.id']);

    onlyRealmWritableQueryResources(query, useRequestEnv(req, 'realm'), [
        'analysisFile.target_realm_id',
        'analysisFile.realm_id',
    ]);

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'analysisFile',
        filters: {
            allowed: [
                'name',
                'root',
                'target_realm_id',
                'type',

                'analysis_id',
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
            allowed: ['name', 'created_at', 'updated_at'],
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
