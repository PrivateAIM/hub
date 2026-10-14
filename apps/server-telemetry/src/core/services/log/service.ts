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
import type { ILogService, LogServiceContext, LogServiceGetManyResult } from './types.ts';

/** LOG_DELETE implies read: a delete-only role must still list what it can delete. */
const READ_PERMISSIONS = [
    PermissionName.LOG_READ,
    PermissionName.LOG_DELETE,
];

/** Page size used when none is requested, and the most a request may ask for. */
const MAX_LIMIT = 100;

export class LogService implements ILogService {
    protected store: LogStore;

    protected validator: LogValidator;

    constructor(ctx: LogServiceContext) {
        this.store = ctx.store;
        this.validator = new LogValidator();
    }

    async create(data: LogInput, actor: ActorContext): Promise<Log> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.LOG_CREATE });

        const validated = await this.validator.run(data);
        return this.store.write(validated);
    }

    /**
     * Logs are decoded with `decodeQueryOpen()`: their filters are dynamic
     * VictoriaLogs labels rather than a declared rapiq vocabulary.
     */
    async getMany(query: unknown, actor: ActorContext): Promise<LogServiceGetManyResult> {
        await actor.permissionEvaluator.preEvaluateOneOf({ name: READ_PERMISSIONS });

        const decoded = decodeQueryOpen(query);

        const { labels } = collectLogFilters(decoded);
        this.assertLabels(labels);

        const requestedLimit = decoded.pagination.limit;
        const limit = requestedLimit && requestedLimit > 0 ?
            Math.min(requestedLimit, MAX_LIMIT) :
            MAX_LIMIT;
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

        let start: number | undefined;
        if (typeof time !== 'undefined') {
            start = Number(time);
            if (!Number.isFinite(start)) {
                throw new BadRequestError('Filter time must be a finite unix timestamp.');
            }
        }

        this.assertLabels(labels);

        await this.store.delete({ start, labels });
    }

    /**
     * Every read and delete must be narrowed by at least one label, so a bare
     * request can never reach the whole log store.
     */
    protected assertLabels(labels: Record<string, unknown>): void {
        if (Object.keys(labels).length === 0) {
            throw new BadRequestError('Filter labels must be specified.');
        }
    }
}
