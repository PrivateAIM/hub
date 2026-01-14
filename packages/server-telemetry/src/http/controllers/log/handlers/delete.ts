/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { PermissionName, isObject } from '@privateaim/kit';
import { useRequestQuery } from '@routup/basic/query';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import { useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { useLogStore } from '../../../../services/index.ts';

export async function deleteManyLogRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({
        name: PermissionName.LOG_DELETE,
    });

    let start : number | undefined;
    const labels : Record<string, string> = {};

    const raw = useRequestQuery(req, 'filter');
    if (isObject(raw)) {
        if (typeof raw.time !== 'undefined') {
            if (typeof raw.time === 'string') {
                start = Number(raw.time);
            } else if (typeof raw.time === 'number') {
                start = raw.time;
            }
        }

        const keys = Object.keys(raw);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            const index = key.indexOf('.');
            if (index === -1) {
                continue;
            }

            const nextKey = key.substring(index + 1);

            if (typeof raw[key] === 'string') {
                labels[nextKey] = raw[key];
            } else if (typeof raw[key] === 'number') {
                labels[nextKey] = `${raw[key]}`;
            }
        }
    }

    const labelKeys = Object.keys(labels);
    if (labelKeys.length === 0) {
        throw new BadRequestError('Filter labels must be specified.');
    }

    const store = useLogStore();
    await store.delete({
        start,
        labels,
    });

    return sendAccepted(res);
}
