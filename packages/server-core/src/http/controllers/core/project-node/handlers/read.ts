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
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceReadable } from '@authup/core-kit';
import { ProjectNodeEntity, onlyRealmWritableQueryResources } from '../../../../../domains';
import { useRequestEnv } from '@privateaim/server-http-kit';

export async function getOneProjectNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');
    const { include } = useRequestQuery(req);

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProjectNodeEntity);
    const query = repository.createQueryBuilder('analysisNode')
        .where('analysisNode.id = :id', { id });

    applyRelations(query, include, {
        allowed: ['node', 'project'],
        defaultAlias: 'analysisNode',
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    if (
        !isRealmResourceReadable(useRequestEnv(req, 'realm'), entity.node_realm_id) &&
        !isRealmResourceReadable(useRequestEnv(req, 'realm'), entity.project_realm_id)
    ) {
        throw new ForbiddenError();
    }

    return send(res, entity);
}

export async function getManyProjectNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();

    const repository = dataSource.getRepository(ProjectNodeEntity);
    const query = repository.createQueryBuilder('analysisNode');
    query.distinctOn(['analysisNode.id']);

    onlyRealmWritableQueryResources(query, useRequestEnv(req, 'realm'), [
        'analysisNode.station_realm_id',
        'analysisNode.project_realm_id',
    ]);

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'analysisNode',
        filters: {
            allowed: [
                'project_realm_id',
                'project_id',
                'project.id',
                'project.name',

                'node_realm_id',
                'node_id',
                'node.name',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: ['node', 'project'],
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
