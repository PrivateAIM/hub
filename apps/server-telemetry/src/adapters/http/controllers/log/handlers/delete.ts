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
import type { LogStore } from '../../../../../core/services/log-store/types.ts';

export async function deleteManyLogRouteHandler(req: Request, res: Response, logStore: LogStore) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.LOG_DELETE });

    let start : number | undefined;
    const labels : Record<string, string> = {};

    const raw = useRequestQuery(req, 'filter');
    if (isObject(raw)) {
        if (typeof raw.time !== 'undefined') {
            const parsed = typeof raw.time === 'string' ? Number(raw.time) : raw.time;
            if (typeof parsed !== 'number' || !Number.isFinite(parsed)) {
                throw new BadRequestError('Filter time must be a finite unix timestamp.');
            }
            start = parsed;
        }

        const keys = Object.keys(raw);
        for (const key of keys) {
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

    await logStore.delete({
        start,
        labels,
    });

    return sendAccepted(res);
}
