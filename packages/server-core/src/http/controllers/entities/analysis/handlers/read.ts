/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send, useRequestParam } from 'routup';
import {
    applyQuery,
    applyRelations,
    useDataSource,
} from 'typeorm-extension';
import { isRealmResourceReadable } from '@privateaim/kit';
import { useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { AnalysisEntity, onlyRealmWritableQueryResources } from '../../../../../database/index.ts';

export async function getOneAnalysisRouteHandler(req: Request, res: Response) : Promise<any> {
    const { include } = useRequestQuery(req);
    const id = useRequestParam(req, 'id');

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);
    const query = repository.createQueryBuilder('analysis')
        .where('analysis.id = :id', { id });

    onlyRealmWritableQueryResources(query, useRequestIdentityRealm(req), 'analysis.realm_id');

    applyRelations(query, include, {
        defaultAlias: 'analysis',
        allowed: ['project', 'master_image'],
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

export async function getManyAnalysisRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);
    const query = repository.createQueryBuilder('analysis');

    const { pagination, filters } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'analysis',
        filters: {
            allowed: [
                'id',
                'name',
                'description',
                'project_id',
                'realm_id',
                'build_status',
                'execution_status',
                'configuration_locked',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: ['project', 'master_image'],
        },
        sort: {
            allowed: ['created_at', 'updated_at'],
            default: {
                updated_at: 'DESC',
            },
        },
    });

    let filterRealmId: string | undefined;

    if (filters) {
        for (let i = 0; i < filters.length; i++) {
            if (
                filters[i].path === 'analysis' &&
                filters[i].key === 'realm_id'
            ) {
                filterRealmId = filters[i].value as string;
                break;
            }
        }
    }

    // todo: analyse-nodes realms should also be valid

    if (filterRealmId) {
        if (!isRealmResourceReadable(useRequestIdentityRealm(req), filterRealmId)) {
            throw new ForbiddenError('You are not permitted to inspect the analysis for the given realm.');
        }
    } else {
        onlyRealmWritableQueryResources(query, useRequestIdentityRealm(req), 'analysis.realm_id');
    }

    const [entities, total] = await query.getManyAndCount();

    return send(res, {
        data: entities,
        meta: {
            total,
            ...pagination,
        },
    });
}
