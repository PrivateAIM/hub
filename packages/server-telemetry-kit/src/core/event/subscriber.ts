/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { isEqual } from 'smob';
import type { EntityEventHandleOptions, IEntityEventHandler, Logger } from '@privateaim/server-kit';
import type { Event, EventData } from '@privateaim/telemetry-kit';
import { DomainType, EVENT_DATA_SECRET_KEY_REGEX } from '@privateaim/telemetry-kit';
import type { ObjectDiff, ObjectLiteral } from '@privateaim/kit';
import { DomainEventName, isObject } from '@privateaim/kit';
import type { IEventPublisher } from './types.ts';

/**
 * Entity timestamp properties, excluded from an update diff so a save does not
 * register as a change on every entity view. Complete as of plan 017: these are
 * the only `*At` properties across every entity in every service.
 *
 * An explicit set rather than an `endsWith('At')` suffix test, deliberately. The
 * suffix form would auto-cover a future timestamp, but it would also silently
 * drop any non-timestamp property whose name happens to end in `At` from the
 * audit trail — a quiet gap. This way a new timestamp column shows up as diff
 * noise until it is added here, which is visible and cheap to fix.
 *
 * **Adding a timestamp column? Add it here too.**
 */
const TIMESTAMP_KEYS = new Set<string>(['createdAt', 'updatedAt', 'expiresAt']);

export type EntityEventHandlerContext = {
    eventComponentCaller?: IEventPublisher,
    logger?: Logger,
};

export class EntityEventHandler implements IEntityEventHandler {
    protected eventComponentCaller?: IEventPublisher;

    protected logger?: Logger;

    constructor(ctx: EntityEventHandlerContext = {}) {
        this.eventComponentCaller = ctx.eventComponentCaller;
        this.logger = ctx.logger;
    }

    async handle(ctx: EntityEventHandleOptions): Promise<void> {
        if (ctx.metadata.refType === DomainType.EVENT) {
            return;
        }

        const entity : Partial<Event> = {
            refType: ctx.metadata.refType,

            name: ctx.metadata.event,
            scope: 'entity',

            // retention is stamped at ingest by server-telemetry (EVENT_RETENTION_DAYS).
        };

        if (ctx.metadata.refId) {
            entity.refId = ctx.metadata.refId;
        }

        const keys : (keyof Event)[] = [
            'actorId',
            'actorType',
            'actorName',
            'requestPath',
            'requestMethod',
            'requestIpAddress',
            'requestUserAgent',
        ];

        for (const key of keys) {
            if (ctx.metadata[key]) {
                (entity as ObjectLiteral)[key] = ctx.metadata[key];
            }
        }

        const data : EventData = {};

        if (
            ctx.metadata.event === DomainEventName.UPDATED &&
            ctx.dataPrevious
        ) {
            const diff : ObjectDiff = {};
            const keys = Object.keys(ctx.data);
            for (const key of keys) {
                // skip date changes. An explicit set rather than a suffix test:
                // the previous `key.endsWith('_at')` silently matched nothing
                // once the properties became camelCase, so every update event
                // started carrying timestamp churn in its diff.
                if (TIMESTAMP_KEYS.has(key)) {
                    continue;
                }

                // Never audit a credential. `ctx.data` is the incoming save
                // payload, so a `select: false` column such as
                // `registry.accountSecret` IS present here while
                // `ctx.dataPrevious` (loaded from the database without
                // select:false columns) is NOT — the value therefore always
                // compares as changed and would always be recorded.
                if (EVENT_DATA_SECRET_KEY_REGEX.test(key)) {
                    continue;
                }

                if (isObject(ctx.data[key]) || Array.isArray(ctx.data[key])) {
                    continue;
                }

                if (!isEqual(ctx.data[key], ctx.dataPrevious[key])) {
                    diff[key] = {
                        next: ctx.data[key],
                        previous: ctx.dataPrevious[key],
                    };
                }
            }

            data.diff = diff;
        }

        entity.data = data;

        if (this.eventComponentCaller) {
            await this.eventComponentCaller.callCreate(entity);

            return;
        }

        if (this.logger) {
            this.logger.debug('Event service is not available to publish events.');
        }
    }
}
