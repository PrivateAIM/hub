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
    useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { ProjectEntity } from '../../../../../database/domains/index.ts';

export async function getOneProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProjectEntity);
    const query = repository.createQueryBuilder('project')
        .where('project.id = :id', { id });

    applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'project',
        fields: {
            default: [
                'id',
                'name',
                'description',
                'nodes',
                'analyses',
                'created_at',
                'updated_at',
                'realm_id',
                'client_id',
                'robot_id',
                'user_id',
                'master_image_id',
            ],
        },
        relations: {
            allowed: ['master_image'],
        },
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function getManyProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();

    const repository = dataSource.getRepository(ProjectEntity);
    const query = repository.createQueryBuilder('project');

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'project',
        fields: {
            default: [
                'id',
                'name',
                'description',
                'analyses',
                'nodes',
                'created_at',
                'updated_at',
                'realm_id',
                'client_id',
                'robot_id',
                'user_id',
                'master_image_id',
            ],
        },
        filters: {
            allowed: ['id', 'name', 'realm_id', 'user_id'],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: ['master_image'],
        },
        sort: {
            allowed: ['id', 'updated_at', 'created_at'],
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
