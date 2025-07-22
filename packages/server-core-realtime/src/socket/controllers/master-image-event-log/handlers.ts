/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildDomainEventFullName } from '@privateaim/kit';
import {
    DomainEventSubscriptionName,
    DomainType,
    buildDomainChannelName,
} from '@privateaim/core-kit';
import {
    isEventCallback,
} from '@privateaim/core-realtime-kit';
import {
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '@privateaim/server-realtime-kit';
import type {
    Socket,
} from '../../types';

export function registerMasterImageEventLogSocketHandlers(socket: Socket) {
    if (!socket.data.userId && !socket.data.robotId) return;

    socket.on(
        buildDomainEventFullName(DomainType.MASTER_IMAGE_EVENT, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.MASTER_IMAGE_EVENT, target));

            if (isEventCallback(cb)) {
                cb(null);
            }
        },
    );

    socket.on(
        buildDomainEventFullName(DomainType.MASTER_IMAGE_EVENT, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.MASTER_IMAGE_EVENT, target));
        },
    );
}
