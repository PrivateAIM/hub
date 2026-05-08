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
    DBody,
    DContext,
    DController,
    DDelete,
    DGet,
    DPost,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import { ForceLoggedInMiddleware, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { parseQueryPagination } from 'rapiq';
import type { IRoutupEvent } from 'routup';
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
        @DBody() body: any,
        @DContext() event: IRoutupEvent,
    ) {
        const permissionChecker = useRequestPermissionChecker(event);
        await permissionChecker.preCheck({ name: PermissionName.LOG_CREATE });

        const validator = new LogValidator();
        const data = await validator.run(body);

        const entity = await this.logStore.write(data);

        event.response.status = 201;
        return entity;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IRoutupEvent,
    ) {
        const permissionChecker = useRequestPermissionChecker(event);
        await permissionChecker.preCheckOneOf({
            name: [
                PermissionName.LOG_READ,
                PermissionName.LOG_DELETE,
            ],
        });

        const labels: Record<string, string> = {};
        const filtersRaw = useRequestQuery(event, 'filter');
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

        const paginationRaw = useRequestQuery(event, 'pagination');
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
        @DContext() event: IRoutupEvent,
    ) {
        const permissionChecker = useRequestPermissionChecker(event);
        await permissionChecker.preCheck({ name: PermissionName.LOG_DELETE });

        let start : number | undefined;
        const labels : Record<string, string> = {};

        const raw = useRequestQuery(event, 'filter');
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

        event.response.status = 202;
        return null;
    }
}
