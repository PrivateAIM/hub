/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName, buildDomainEventFullName } from '@privateaim/kit';
import {
    DomainEventSubscriptionName,
    DomainType,
    buildDomainChannelName,
} from '@privateaim/core-kit';
import {
    isEventCallback,
} from '@privateaim/core-realtime-kit';
import {
    isSocketAuthenticated,
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '@privateaim/server-realtime-kit';
import { buildSocketSubscribeError } from '../../error.ts';
import { assertSocketSubscribeReach } from '../../reach.ts';
import type {
    Socket,
} from '../../types.ts';

export function registerProjectSocketHandlers(socket: Socket) {
    if (!isSocketAuthenticated(socket)) {
        return;
    }

    socket.on(
        buildDomainEventFullName(DomainType.PROJECT, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            try {
                await assertSocketSubscribeReach(socket.data, [
                    PermissionName.PROJECT_DELETE,
                    PermissionName.PROJECT_UPDATE,
                ]);
            } catch (e) {
                if (isEventCallback(cb)) {
                    cb(buildSocketSubscribeError(e));
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.PROJECT, target));

            if (isEventCallback(cb)) {
                cb(null);
            }
        },
    );

    socket.on(
        buildDomainEventFullName(DomainType.PROJECT, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.PROJECT, target));
        },
    );
}
