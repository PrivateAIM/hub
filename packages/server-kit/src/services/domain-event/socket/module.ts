/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildDomainEventFullName } from '@privateaim/kit';
import { Emitter } from '@socket.io/redis-emitter';
import type { Client } from 'redis-extension';
import type { DomainEventPublishContext, IDomainEventPublisher } from '../type';
import { buildEventChannelName, transformEventData } from '../utils';

export class DomainEventSocketPublisher implements IDomainEventPublisher {
    protected client : Client;

    constructor(client: Client) {
        this.client = client;
    }

    async publish(ctx: DomainEventPublishContext) : Promise<void> {
        ctx.data = transformEventData(ctx.data);

        for (let i = 0; i < ctx.destinations.length; i++) {
            let namespace : string;
            if (ctx.destinations[i].namespace) {
                namespace = ctx.destinations[i].namespace;
            } else {
                namespace = '/';
            }

            const emitter = new Emitter(this.client, {}, namespace);

            const fullEventName = buildDomainEventFullName(ctx.data.type, ctx.data.event);

            const rooms : string[] = [
                buildEventChannelName(ctx.destinations[i].channel),
            ];

            if (typeof ctx.destinations[i].channel === 'function') {
                rooms.push(buildEventChannelName(ctx.destinations[i].channel, ctx.data.data.id));
            }

            for (let j = 0; j < rooms.length; j++) {
                emitter
                    .in(rooms[j])
                    .emit(fullEventName, {
                        ...ctx.data,
                        meta: {
                            namespace,
                            roomName: rooms[j],
                        },
                    });
            }
        }
    }
}
