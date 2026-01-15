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
import { AnalysisBucketEntity, onlyRealmWritableQueryResources } from '../../../../../database/domains/index.ts';

export async function getOneAnalysisBucketRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisBucketEntity);
    const query = repository.createQueryBuilder('analysisBucket')
        .where('analysisBucket.id = :id', { id });

    applyRelations(query, useRequestQuery(req, 'include'), {
        allowed: ['analysis'],
        defaultAlias: 'analysisBucket',
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

export async function getManyAnalysisBucketRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisBucketEntity);
    const query = repository.createQueryBuilder('analysisBucket');
    query.distinctOn(['analysisBucket.id']);

    onlyRealmWritableQueryResources(query, useRequestIdentityRealm(req), [
        'analysisBucket.realm_id',
    ]);

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'analysisBucket',
        filters: {
            allowed: [
                'analysis_id',
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
            allowed: ['type', 'created_at', 'updated_at'],
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
