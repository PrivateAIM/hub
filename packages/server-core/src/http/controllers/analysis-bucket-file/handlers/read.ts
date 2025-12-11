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
import { AnalysisBucketFileEntity, onlyRealmWritableQueryResources } from '../../../../database';

export async function getOneAnalysisBucketFileRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisBucketFileEntity);
    const query = repository.createQueryBuilder('analysisFile')
        .where('analysisFile.id = :id', { id });

    applyRelations(query, useRequestQuery(req, 'include'), {
        allowed: ['analysis', 'analysis_bucket'],
        defaultAlias: 'analysisFile',
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceReadable(useRequestIdentityRealm(req), entity.realm_id)) {
        throw new ForbiddenError();
    }

    return send(res, entity);
}

export async function getManyAnalysisBucketFileRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisBucketFileEntity);
    const query = repository.createQueryBuilder('analysisFile');
    query.distinctOn(['analysisFile.id']);

    onlyRealmWritableQueryResources(query, useRequestIdentityRealm(req), [
        'analysisFile.realm_id',
    ]);

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'analysisFile',
        filters: {
            allowed: [
                'name',
                'root',
                'analysis_bucket_id',
                'analysis_id',

                'analysis_id',
                'analysis.id',
                'analysis.name',

                'analysis_bucket.type',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: ['analysis', 'analysis_bucket'],
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
