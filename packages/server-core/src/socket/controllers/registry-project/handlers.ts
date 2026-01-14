/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DomainEventSubscriptionName,
    DomainType,
    buildDomainChannelName,
} from '@privateaim/core-kit';
import {
    isEventCallback,
} from '@privateaim/core-realtime-kit';
import { UnauthorizedError } from '@ebec/http';
import { PermissionName, buildDomainEventFullName } from '@privateaim/kit';
import {
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '@privateaim/server-realtime-kit';
import type {
    Socket,
} from '../../types.ts';

export function registerRegistryProjectSocketHandlers(socket: Socket) {
    if (!socket.data.userId && !socket.data.robotId) return;

    socket.on(
        buildDomainEventFullName(DomainType.REGISTRY_PROJECT, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            try {
                await socket.data.permissionChecker.preCheckOneOf({
                    name: [
                        PermissionName.REGISTRY_MANAGE,
                        PermissionName.REGISTRY_PROJECT_MANAGE,
                    ],
                });
            } catch (e) {
                if (isEventCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.REGISTRY_PROJECT, target));

            if (isEventCallback(cb)) {
                cb(null);
            }
        },
    );

    socket.on(
        buildDomainEventFullName(DomainType.REGISTRY_PROJECT, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.REGISTRY_PROJECT, target));
        },
    );
}
