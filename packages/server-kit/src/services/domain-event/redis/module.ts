/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from 'redis-extension';
import type { DomainEventRecord } from '@privateaim/kit';
import type { DomainEventPublishOptions, IDomainEventConsumer } from '../types';
import { transformEventData } from '../utils';
import { buildDomainEventRedisChannel } from './helpers';

export class DomainEventRedisPublisher implements IDomainEventConsumer {
    protected driver : Client;

    constructor(client: Client) {
        this.driver = client;
    }

    async consume(ctx: DomainEventPublishOptions) : Promise<void> {
        const payload : DomainEventRecord = {
            type: ctx.metadata.domain,
            event: ctx.metadata.event,
            data: transformEventData(ctx.data),
        };

        const payloadSerialized = JSON.stringify(payload);

        const pipeline = this.driver.pipeline();
        for (let i = 0; i < ctx.destinations.length; i++) {
            const destination = ctx.destinations[i];

            const key = buildDomainEventRedisChannel(
                destination.channel,
                destination.namespace,
            );

            pipeline.publish(key, payloadSerialized);
        }

        await pipeline.exec();
    }
}
