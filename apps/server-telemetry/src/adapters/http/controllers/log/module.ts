/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import type { Log, LogInput } from '@privateaim/telemetry-kit';
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
import type { IAppEvent } from 'routup';
import type { LogStore } from '../../../../core/services/log-store/types.ts';
import { collectRootFilterValues, decodeQueryOpen } from '../../../../core/query/index.ts';

@DTags('logs')
@DController('/logs')
export class LogController {
    private logStore: LogStore;

    constructor(ctx: { logStore: LogStore }) {
        this.logStore = ctx.logStore;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async create(
        @DBody() body: LogInput,
        @DContext() event: IAppEvent,
    ): Promise<Log> {
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
        @DContext() event: IAppEvent,
    ) {
        const permissionChecker = useRequestPermissionChecker(event);
        await permissionChecker.preCheckOneOf({
            name: [
                PermissionName.LOG_READ,
                PermissionName.LOG_DELETE,
            ],
        });

        const decoded = decodeQueryOpen(useRequestQuery(event));

        const labels: Record<string, string> = {};
        for (const [key, value] of Object.entries(collectRootFilterValues(decoded))) {
            const index = key.indexOf('.');
            const nextKey = index === -1 ? key : key.substring(index + 1);
            labels[nextKey] = value;
        }

        const labelKeys = Object.keys(labels);
        if (labelKeys.length === 0) {
            throw new BadRequestError('Filter labels must be specified.');
        }

        const limit = decoded.pagination.limit && decoded.pagination.limit > 0 ?
            Math.min(decoded.pagination.limit, 100) :
            100;
        const offset = decoded.pagination.offset || 0;

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
        @DContext() event: IAppEvent,
    ) {
        const permissionChecker = useRequestPermissionChecker(event);
        await permissionChecker.preCheck({ name: PermissionName.LOG_DELETE });

        let start : number | undefined;
        const labels : Record<string, string> = {};

        for (const [key, value] of Object.entries(collectRootFilterValues(decodeQueryOpen(useRequestQuery(event))))) {
            if (key === 'time') {
                const parsed = Number(value);
                if (!Number.isFinite(parsed)) {
                    throw new BadRequestError('Filter time must be a finite unix timestamp.');
                }
                start = parsed;
                continue;
            }

            const index = key.indexOf('.');
            const nextKey = index === -1 ? key : key.substring(index + 1);
            labels[nextKey] = value;
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
