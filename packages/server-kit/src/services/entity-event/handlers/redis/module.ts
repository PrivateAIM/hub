/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from 'redis-extension';
import type { DomainEventRecord } from '@privateaim/kit';
import type { EntityEventHandleOptions, IEntityEventHandler } from '../../types';
import { transformEntityEventData } from '../../utils';
import { buildEntityEventRedisChannel } from './helpers';

export class EntityEventRedisHandler implements IEntityEventHandler {
    protected driver : Client;

    constructor(client: Client) {
        this.driver = client;
    }

    async handle(ctx: EntityEventHandleOptions) : Promise<void> {
        const payload : DomainEventRecord = {
            type: ctx.metadata.ref_type,
            event: ctx.metadata.event,
            data: transformEntityEventData(ctx.data),
        };

        const payloadSerialized = JSON.stringify(payload);

        const pipeline = this.driver.pipeline();
        for (let i = 0; i < ctx.destinations.length; i++) {
            const destination = ctx.destinations[i];

            const key = buildEntityEventRedisChannel(
                destination.channel,
                destination.namespace,
            );

            pipeline.publish(key, payloadSerialized);
        }

        await pipeline.exec();
    }
}
