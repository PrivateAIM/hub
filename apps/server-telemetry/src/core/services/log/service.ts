/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import type { Log, LogInput } from '@privateaim/telemetry-kit';
import { LogValidator } from '@privateaim/telemetry-kit';
import type { ActorContext } from '@privateaim/server-kit';
import { collectLogFilters, decodeQueryOpen } from '../../query/index.ts';
import type { LogStore } from '../log-store/types.ts';
import type { ILogService, LogServiceGetManyResult } from './types.ts';

export class LogService implements ILogService {
    protected store: LogStore;

    constructor(ctx: { store: LogStore }) {
        this.store = ctx.store;
    }

    async create(data: LogInput, actor: ActorContext): Promise<Log> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.LOG_CREATE });

        const validator = new LogValidator();
        return this.store.write(await validator.run(data));
    }

    /**
     * Logs are decoded with `decodeQueryOpen()` — their filters are dynamic
     * VictoriaLogs labels rather than a declared rapiq vocabulary.
     */
    async getMany(query: unknown, actor: ActorContext): Promise<LogServiceGetManyResult> {
        await actor.permissionEvaluator.preEvaluateOneOf({
            name: [
                PermissionName.LOG_READ,
                PermissionName.LOG_DELETE,
            ],
        });

        const decoded = decodeQueryOpen(query);

        const { labels } = collectLogFilters(decoded);
        if (Object.keys(labels).length === 0) {
            throw new BadRequestError('Filter labels must be specified.');
        }

        const limit = decoded.pagination.limit && decoded.pagination.limit > 0 ?
            Math.min(decoded.pagination.limit, 100) :
            100;
        const offset = decoded.pagination.offset || 0;

        const [data, total] = await this.store.query({
            labels,
            limit,
            offset,
            sort: 'DESC',
        });

        return {
            data,
            meta: {
                total, 
                limit, 
                offset, 
            }, 
        };
    }

    async deleteMany(query: unknown, actor: ActorContext): Promise<void> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.LOG_DELETE });

        const { labels, time } = collectLogFilters(decodeQueryOpen(query), { extractTime: true });

        let start : number | undefined;
        if (typeof time !== 'undefined') {
            start = Number(time);
            if (!Number.isFinite(start)) {
                throw new BadRequestError('Filter time must be a finite unix timestamp.');
            }
        }

        if (Object.keys(labels).length === 0) {
            throw new BadRequestError('Filter labels must be specified.');
        }

        await this.store.delete({ start, labels });
    }
}
