/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainsEventContext } from '@privateaim/core';
import { DomainEventName, buildDomainEventFullName } from '@privateaim/core';
import { Emitter } from '@socket.io/redis-emitter';
import type { Client } from 'redis-extension';
import type { DomainEventDestinations } from '../type';
import { buildDomainEventChannelName, transformDomainEventData } from '../utils';

export function publishDomainSocketEvent(
    client: Client,
    context: DomainsEventContext,
    destinations: DomainEventDestinations,
) {
    context = transformDomainEventData(context);

    for (let i = 0; i < destinations.length; i++) {
        let emitter = new Emitter(client);
        if (destinations[i].namespace) {
            emitter = emitter.of(destinations[i].namespace);
        }

        let roomName = buildDomainEventChannelName(destinations[i].channel);

        const fullEventName = buildDomainEventFullName(context.type, context.event);

        emitter
            .in(roomName)
            .emit(fullEventName, {
                ...context,
                meta: {
                    roomName,
                },
            });

        if (
            context.event !== DomainEventName.CREATED &&
            typeof destinations[i].channel === 'function'
        ) {
            roomName = buildDomainEventChannelName(destinations[i].channel, context.data.id);
            emitter
                .in(roomName)
                .emit(fullEventName, {
                    ...context,
                    meta: {
                        roomName,
                        roomId: context.data.id,
                    },
                });
        }
    }
}
