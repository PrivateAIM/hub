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
import { UnauthorizedError } from '@privateaim/errors';
import {
    isSocketAuthenticated,
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '@privateaim/server-realtime-kit';
import type { Socket } from '../../types.ts';

export function registerMasterImageSocketHandlers(socket: Socket) {
    if (!isSocketAuthenticated(socket)) return;

    socket.on(
        buildDomainEventFullName(DomainType.MASTER_IMAGE, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            // The same grants the HTTP read requires.
            try {
                await socket.data.permissionEvaluator.preEvaluateOneOf({
                    name: [
                        PermissionName.MASTER_IMAGE_READ,
                        PermissionName.MASTER_IMAGE_MANAGE,
                    ],
                });
            } catch {
                if (isEventCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.MASTER_IMAGE, target));

            if (isEventCallback(cb)) {
                cb(null);
            }
        },
    );

    socket.on(
        buildDomainEventFullName(DomainType.MASTER_IMAGE, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.MASTER_IMAGE, target));
        },
    );
}
