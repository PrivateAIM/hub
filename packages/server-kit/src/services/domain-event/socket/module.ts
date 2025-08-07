/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildDomainEventFullName } from '@privateaim/kit';
import { Emitter } from '@socket.io/redis-emitter';
import type { Client } from 'redis-extension';
import type { DomainEventPublishOptions, IDomainEventConsumer } from '../types';
import { transformEventData } from '../utils';
import { buildDomainEventSocketChannel, buildDomainEventSocketNamespace } from './helpers';

export class DomainEventSocketConsumer implements IDomainEventConsumer {
    protected client : Client;

    constructor(client: Client) {
        this.client = client;
    }

    async consume(ctx: DomainEventPublishOptions) : Promise<void> {
        ctx.data = transformEventData(ctx.data);

        for (let i = 0; i < ctx.destinations.length; i++) {
            const destination = ctx.destinations[i];

            const namespace = buildDomainEventSocketNamespace(destination.namespace);
            const roomName = buildDomainEventSocketChannel(destination.channel);

            const fullEventName = buildDomainEventFullName(
                ctx.metadata.domain,
                ctx.metadata.event,
            );

            const emitter = new Emitter(this.client, {}, namespace);

            emitter
                .in(roomName)
                .emit(fullEventName, {
                    data: {
                        data: ctx.data,
                        type: ctx.metadata.domain,
                        event: ctx.metadata.event,
                    },
                    meta: {
                        namespace,
                        roomName,
                    },
                });
        }
    }
}
