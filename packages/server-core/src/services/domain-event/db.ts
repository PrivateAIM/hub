/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { isEqual } from 'smob';
import type { DomainEventPublishOptions, IDomainEventPublisher } from '@privateaim/server-kit';
import { useDataSource } from 'typeorm-extension';
import { DomainEventName, DomainType } from '@privateaim/core-kit';
import type { ObjectDiff } from '@privateaim/kit';
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
        });

        if (ctx.metadata.identity) {
            if (ctx.metadata.identity.type) {
                entity.actor_type = ctx.metadata.identity.type;
            }

            if (ctx.metadata.identity.id) {
                entity.actor_id = ctx.metadata.identity.id;
            }

            if (ctx.metadata.identity.name) {
                entity.actor_name = ctx.metadata.identity.name;
            }

            if (ctx.metadata.identity.ipAddress) {
                entity.actor_ip_address = ctx.metadata.identity.ipAddress;
            }
        }

        if (
            ctx.metadata.event === DomainEventName.UPDATED &&
            ctx.dataPrevious
        ) {
            const data : ObjectDiff = {};
            const keys = Object.keys(ctx.data);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];

                if (isObject(data[key]) || Array.isArray(data[key])) {
                    continue;
                }

                if (!isEqual(ctx.data[key], ctx.dataPrevious[key])) {
                    data[key] = {
                        current: ctx.data[key],
                        previous: ctx.dataPrevious[key],
                    };
                }
            }

            entity.data = data;
        }

        await repository.save(entity);
    }
}
