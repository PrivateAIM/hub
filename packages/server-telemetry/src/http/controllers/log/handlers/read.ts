/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { PermissionName, isObject } from '@privateaim/kit';
import { useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { useRequestQuery } from '@routup/basic/query';
import { parseQueryPagination } from 'rapiq';
import type { Request, Response } from 'routup';
import { send } from 'routup';
import { useLogStore } from '../../../../services';

export async function getManyLogLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheckOneOf({
        name: [
            PermissionName.LOG_READ,
            PermissionName.LOG_DELETE,
        ],
    });

    const labels: Record<string, string> = {};
    const filtersRaw = useRequestQuery(req, 'filter');
    if (isObject(filtersRaw)) {
        const keys = Object.keys(filtersRaw);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            const index = key.indexOf('.');
            if (index === -1) {
                continue;
            }

            const nextKey = key.substring(index + 1);

            if (typeof filtersRaw[key] === 'string') {
                labels[nextKey] = filtersRaw[key];
            } else if (typeof filtersRaw[key] === 'number') {
                labels[nextKey] = `${filtersRaw[key]}`;
            }
        }
    }

    const labelKeys = Object.keys(labels);
    if (labelKeys.length === 0) {
        throw new BadRequestError('Filter labels must be specified.');
    }

    const paginationRaw = useRequestQuery(req, 'pagination');
    const pagination = parseQueryPagination(paginationRaw, {
        maxLimit: 100,
    });

    const limit = pagination.limit || 100;
    const offset = pagination.offset || 0;

    const factor = Math.floor(Math.max(offset, limit) / limit);

    const dayInMs = 1_000 * 60 * 60 * 24;
    const start = Date.now() - (factor * dayInMs);
    const end = Date.now() - ((factor - 1) * dayInMs);

    // todo: there can be more than 100 log lines in one day ...

    // todo: get all entries in start/end range...
    const store = useLogStore();
    const [entities, total] = await store.query({
        start,
        end,
        labels,
        limit: 1_000,
        sort: 'DESC',
    });

    return send(res, {
        data: entities.map((entity) => {
            if (typeof entity.time === 'bigint') {
                entity.time = `${entity.time}`;
            }

            return entity;
        }),
        meta: {
            total,
            limit,
            offset,
        },
    });
}
