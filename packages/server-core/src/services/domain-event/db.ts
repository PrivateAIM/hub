/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { isEqual } from 'smob';
import type { DomainEventPublishOptions, IDomainEventPublisher } from '@privateaim/server-kit';
import { useDataSource } from 'typeorm-extension';
import type { Event, EventData } from '@privateaim/core-kit';
import { DomainEventName, DomainType } from '@privateaim/core-kit';
import type { ObjectDiff, ObjectLiteral } from '@privateaim/kit';
import { isObject } from '@privateaim/kit';
import { EventEntity } from '../../database';

export class DomainEventDatabasePublisher implements IDomainEventPublisher {
    async publish(ctx: DomainEventPublishOptions): Promise<void> {
        if (ctx.metadata.domain === DomainType.EVENT) {
            return;
        }

        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(EventEntity);

        const entity = repository.create({
            ref_type: ctx.metadata.domain,
            ref_id: ctx.data.id,
            name: ctx.metadata.event,
            scope: 'model',
            expiring: true,
            expires_at: new Date(
                Date.now() + (1000 * 60 * 60 * 24 * 7),
            ).toISOString(),
        });

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

        await repository.save(entity);
    }
}
