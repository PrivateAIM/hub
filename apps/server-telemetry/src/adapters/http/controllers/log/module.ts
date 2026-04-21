/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { PermissionName, isObject } from '@privateaim/kit';
import { LogValidator } from '@privateaim/telemetry-kit';
import {
    DController,
    DDelete,
    DGet,
    DPost,
    DRequest,
    DResponse,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import { ForceLoggedInMiddleware, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { parseQueryPagination } from 'rapiq';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import type { LogStore } from '../../../../core/services/log-store/types.ts';

@DTags('logs')
@DController('/logs')
export class LogController {
    private logStore: LogStore;

    constructor(ctx: { logStore: LogStore }) {
        this.logStore = ctx.logStore;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async create(
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const permissionChecker = useRequestPermissionChecker(req);
        await permissionChecker.preCheck({ name: PermissionName.LOG_CREATE });

        const validator = new LogValidator();
        const validatorAdapter = new RoutupContainerAdapter(validator);
        const data = await validatorAdapter.run(req);

        const entity = await this.logStore.write(data);

        res.statusCode = 201;
        return entity;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: Request,
    ) {
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
            for (const key of keys) {
                const index = key.indexOf('.');

                let nextKey : string;
                if (index !== -1) {
                    nextKey = key.substring(index + 1);
                } else {
                    nextKey = key;
                }

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
        const pagination = parseQueryPagination(paginationRaw, { maxLimit: 100 });

        const limit = pagination.limit || 100;
        const offset = pagination.offset || 0;

        const [entities, total] = await this.logStore.query({
            labels,
            limit,
            offset,
            sort: 'DESC',
        });

        return {
            data: entities,
            meta: {
                total,
                limit,
                offset,
            },
        };
    }

    @DDelete('', [ForceLoggedInMiddleware])
    async deleteMany(
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
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
                if (key === 'time') {
                    continue;
                }

                const index = key.indexOf('.');
                const nextKey = index === -1 ?
                    key :
                    key.substring(index + 1);

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

        await this.logStore.delete({
            start,
            labels,
        });

        return sendAccepted(res);
    }
}
