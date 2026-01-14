/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName } from '@privateaim/kit';
import { useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { send, useRequestParam } from 'routup';
import {
    applyQuery,
    useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { EventEntity } from '../../../../database/index.ts';

export async function getOneEventLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheckOneOf({
        name: [
            PermissionName.EVENT_READ,
            PermissionName.EVENT_DELETE,
        ],
    });

    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(EventEntity);
    const query = repository.createQueryBuilder('event')
        .where('event.id = :id', { id });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function getManyEventLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheckOneOf({
        name: [
            PermissionName.EVENT_READ,
            PermissionName.EVENT_DELETE,
        ],
    });

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(EventEntity);
    const query = repository.createQueryBuilder('ev');

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'ev',
        filters: {
            allowed: [
                'scope',
                'name',
                'ref_type',
                'ref_id',
                'realm_id',
                'created_at',
                'updated_at',
            ],
        },
        pagination: {
            maxLimit: 50,
        },
        relations: {
            allowed: [],
        },
        sort: {
            allowed: [
                'expires_at',
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
