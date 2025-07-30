/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildDomainEventFullName } from '@privateaim/kit';
import { Emitter } from '@socket.io/redis-emitter';
import type { Client } from 'redis-extension';
import type { DomainEventPublishOptions, IDomainEventPublisher } from '../types';
import { buildEventChannelName, transformEventData } from '../utils';

export class DomainEventSocketPublisher implements IDomainEventPublisher {
    protected client : Client;

    constructor(client: Client) {
        this.client = client;
    }

    async publish(ctx: DomainEventPublishOptions) : Promise<void> {
        ctx.data = transformEventData(ctx.data);

        for (let i = 0; i < ctx.destinations.length; i++) {
            const destination = ctx.destinations[i];

            let namespace : string;
            if (destination.namespace) {
                namespace = typeof destination.namespace === 'function' ?
                    destination.namespace(ctx.data) :
                    destination.namespace;
            } else {
                namespace = '/';
            }

            const emitter = new Emitter(this.client, {}, namespace);

            const fullEventName = buildDomainEventFullName(
                ctx.metadata.domain,
                ctx.metadata.event,
            );

            const rooms : string[] = [
                buildEventChannelName(destination.channel),
            ];

            if (typeof destination.channel === 'function') {
                rooms.push(buildEventChannelName(destination.channel, ctx.data.id));
            }

            for (let j = 0; j < rooms.length; j++) {
                emitter
                    .in(rooms[j])
                    .emit(fullEventName, {
                        data: {
                            data: ctx.data,
                            type: ctx.metadata.domain,
                            event: ctx.metadata.event,
                        },
                        meta: {
                            namespace,
                            roomName: rooms[j],
                        },
                    });
            }
        }
    }
}
