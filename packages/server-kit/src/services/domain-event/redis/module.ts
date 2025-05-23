/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from 'redis-extension';
import type { DomainEventPublishContext, IDomainEventPublisher } from '../type';
import { buildEventChannelName, transformEventData } from '../utils';

export class DomainEventRedisPublisher implements IDomainEventPublisher {
    protected driver : Client;

    constructor(client: Client) {
        this.driver = client;
    }

    async publish(ctx: DomainEventPublishContext) : Promise<void> {
        const data = JSON.stringify(transformEventData(ctx.data));

        const pipeline = this.driver.pipeline();
        for (let i = 0; i < ctx.destinations.length; i++) {
            const keyPrefix = (ctx.destinations[i].namespace ? `${ctx.destinations[i].namespace}:` : '');

            let key = keyPrefix + buildEventChannelName(ctx.destinations[i].channel);
            pipeline.publish(key, data);

            if (typeof ctx.destinations[i].channel === 'function') {
                key = keyPrefix + buildEventChannelName(ctx.destinations[i].channel, ctx.data.data.id);
                pipeline.publish(key, data);
            }
        }

        await pipeline.exec();
    }
}
