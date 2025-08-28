/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildDomainEventFullName } from '@privateaim/kit';
import { Emitter } from '@socket.io/redis-emitter';
import type { Client } from 'redis-extension';
import type { EntityEventHandleOptions, IEntityEventHandler } from '../../types';
import { transformEntityEventData } from '../../utils';

export class EntityEventSocketHandler implements IEntityEventHandler {
    protected client : Client;

    constructor(client: Client) {
        this.client = client;
    }

    async handle(ctx: EntityEventHandleOptions) : Promise<void> {
        ctx.data = transformEntityEventData(ctx.data);

        for (let i = 0; i < ctx.destinations.length; i++) {
            const destination = ctx.destinations[i];

            const namespace = this.buildNamespace(destination.namespace);
            const roomName = this.buildChannel(destination.channel);

            const fullEventName = buildDomainEventFullName(
                ctx.metadata.ref_type,
                ctx.metadata.event,
            );

            const emitter = new Emitter(this.client, {}, namespace);

            emitter
                .in(roomName)
                .emit(fullEventName, {
                    data: {
                        data: ctx.data,
                        type: ctx.metadata.ref_type,
                        event: ctx.metadata.event,
                    },
                    meta: {
                        namespace,
                        roomName,
                    },
                });
        }
    }

    protected buildNamespace(namespace?: string | string[]) {
        if (typeof namespace === 'undefined') {
            return '/';
        }

        if (typeof namespace === 'string') {
            return namespace.startsWith('/') ? namespace : `/${namespace}`;
        }

        return `/${namespace.join('/')}`;
    }

    protected buildChannel(channel: string | string[]) {
        if (typeof channel === 'string') {
            return channel;
        }

        return channel.join('/');
    }
}
