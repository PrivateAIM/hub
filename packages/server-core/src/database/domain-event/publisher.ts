/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { isEqual } from 'smob';
import type { DomainEventConsumeOptions, IDomainEventConsumer } from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import type { Event, EventData } from '@privateaim/telemetry-kit';
import { DomainEventName } from '@privateaim/core-kit';
import type { ObjectDiff, ObjectLiteral } from '@privateaim/kit';
import { isObject } from '@privateaim/kit';
import { isEventComponentServiceUsable, useEventComponentService } from '@privateaim/server-telemetry-kit';

export class DatabaseDomainEventConsumer implements IDomainEventConsumer {
    async consume(ctx: DomainEventConsumeOptions): Promise<void> {
        const entity : Partial<Event> = {
            ref_type: ctx.metadata.domain,
            ref_id: ctx.data.id,
            name: ctx.metadata.event,
            scope: 'model',
            expiring: true,
            expires_at: new Date(
                Date.now() + (1000 * 60 * 60 * 24 * 7),
            ).toISOString(),
        };

        const keys : (keyof Event)[] = [
            'actor_id',
            'actor_type',
            'actor_name',
            'request_path',
            'request_method',
            'request_ip_address',
            'request_user_agent',
        ];

        for (let i = 0; i < keys.length; i++) {
            if (ctx.metadata[keys[i]]) {
                (entity as ObjectLiteral)[keys[i]] = ctx.metadata[keys[i]];
            }
        }

        if (
            entity.request_ip_address &&
            entity.request_ip_address === '::1'
        ) {
            entity.request_ip_address = '127.0.0.1';
        }

        const data : EventData = {};

        if (
            ctx.metadata.event === DomainEventName.UPDATED &&
            ctx.dataPrevious
        ) {
            const diff : ObjectDiff = {};
            const keys = Object.keys(ctx.data);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];

                // skip date changes
                if (key.endsWith('_at')) {
                    continue;
                }

                if (isObject(diff[key]) || Array.isArray(diff[key])) {
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

        if (isEventComponentServiceUsable()) {
            const eventService = useEventComponentService();
            await eventService.command({
                command: 'create',
                data: entity,
            });

            return;
        }

        useLogger().debug('Event service is not available to publish domain events.');
    }
}
