/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { isEqual } from 'smob';
import type { EntityEventHandleOptions, IEntityEventHandler, Logger } from '@privateaim/server-kit';
import type { Event, EventData } from '@privateaim/telemetry-kit';
import { DomainType } from '@privateaim/telemetry-kit';
import type { ObjectDiff, ObjectLiteral } from '@privateaim/kit';
import { WEEK_IN_MS, isObject } from '@privateaim/kit';
import type { EventComponentCaller } from '../../components';

/**
 * Entity timestamp properties, excluded from an update diff so a save does not
 * register as a change on every entity view.
 */
const TIMESTAMP_KEYS = new Set<string>(['createdAt', 'updatedAt', 'expiresAt']);

export type EntityEventHandlerContext = {
    eventComponentCaller?: EventComponentCaller,
    logger?: Logger,
};

export class EntityEventHandler implements IEntityEventHandler {
    protected eventComponentCaller?: EventComponentCaller;

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

            expiring: true,
            expiresAt: new Date(
                Date.now() + WEEK_IN_MS,
            ).toISOString(),
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

        if (
            entity.requestIpAddress &&
            entity.requestIpAddress === '::1'
        ) {
            entity.requestIpAddress = '127.0.0.1';
        }

        const data : EventData = {};

        if (
            // todo: use enum
            ctx.metadata.event === 'updated' &&
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
