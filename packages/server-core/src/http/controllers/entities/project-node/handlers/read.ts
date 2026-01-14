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
import { isRealmResourceReadable } from '@privateaim/kit';
import { useRequestIdentityRealm } from '@privateaim/server-http-kit';
import { ProjectNodeEntity, onlyRealmWritableQueryResources } from '../../../../../database/domains/index.ts';

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
        !isRealmResourceReadable(useRequestIdentityRealm(req), entity.node_realm_id) &&
        !isRealmResourceReadable(useRequestIdentityRealm(req), entity.project_realm_id)
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

    onlyRealmWritableQueryResources(query, useRequestIdentityRealm(req), [
        'analysisNode.node_realm_id',
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
            allowed: [
                'created_at',
                'updated_at',
                'project.name',
                'project.created_at',
                'project.updated_at',
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
