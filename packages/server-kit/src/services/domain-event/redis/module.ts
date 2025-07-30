/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from 'redis-extension';
import type { DomainEventRecord } from '@privateaim/kit';
import type { DomainEventPublishOptions, IDomainEventPublisher } from '../types';
import { buildEventChannelName, transformEventData } from '../utils';

export class DomainEventRedisPublisher implements IDomainEventPublisher {
    protected driver : Client;

    constructor(client: Client) {
        this.driver = client;
    }

    async publish(ctx: DomainEventPublishOptions) : Promise<void> {
        const payload : DomainEventRecord = {
            type: ctx.metadata.domain,
            event: ctx.metadata.event,
            data: transformEventData(ctx.data),
        };
        const payloadSerialized = JSON.stringify(payload);

        const pipeline = this.driver.pipeline();
        for (let i = 0; i < ctx.destinations.length; i++) {
            const destination = ctx.destinations[i];

            let keyPrefix : string | undefined;
            if (destination.namespace) {
                keyPrefix = typeof destination.namespace === 'function' ?
                    destination.namespace(ctx.data) :
                    destination.namespace;
            }

            let key : string;
            if (keyPrefix) {
                key = keyPrefix + buildEventChannelName(destination.channel);
            } else {
                key = buildEventChannelName(destination.channel);
            }

            pipeline.publish(key, payloadSerialized);

            if (typeof destination.channel === 'function') {
                key = keyPrefix + buildEventChannelName(destination.channel, ctx.data.id);
                pipeline.publish(key, payloadSerialized);
            }
        }

        await pipeline.exec();
    }
}
