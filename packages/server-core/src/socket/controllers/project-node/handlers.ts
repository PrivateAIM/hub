/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DomainEventSubscriptionName,
    DomainSubType,
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

export function registerProjectNodeSocketHandlers(socket: Socket) {
    if (!socket.data.userId && !socket.data.robotId) return;

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventFullName(DomainType.PROJECT_NODE, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            try {
                await socket.data.permissionChecker.preCheckOneOf({
                    name: [
                        PermissionName.PROJECT_APPROVE,
                    ],
                });
            } catch (e) {
                if (isEventCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.PROJECT_NODE, target));

            if (isEventCallback(cb)) {
                cb(null);
            }
        },
    );

    socket.on(
        buildDomainEventFullName(DomainType.PROJECT_NODE, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.PROJECT_NODE, target));
        },
    );
}

export function registerProjectNodeForRealmSocketHandlers(socket: Socket) {
    if (!socket.data.userId && !socket.data.robotId) return;

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventFullName(DomainSubType.PROJECT_NODE_IN, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            try {
                await socket.data.permissionChecker.preCheckOneOf({
                    name: [
                        PermissionName.PROJECT_APPROVE,
                    ],
                });
            } catch (e) {
                if (isEventCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(
                socket,
                buildDomainChannelName(DomainSubType.PROJECT_NODE_IN, target),
            );

            if (isEventCallback(cb)) {
                cb(null);
            }
        },
    );

    socket.on(
        buildDomainEventFullName(DomainSubType.PROJECT_NODE_IN, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(
                socket,
                buildDomainChannelName(DomainSubType.PROJECT_NODE_IN, target),
            );
        },
    );

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventFullName(DomainSubType.PROJECT_NODE_OUT, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            try {
                await socket.data.permissionChecker.preCheckOneOf({
                    name: [
                        PermissionName.PROJECT_UPDATE,
                    ],
                });
            } catch (e) {
                if (isEventCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(
                socket,
                buildDomainChannelName(DomainSubType.PROJECT_NODE_OUT, target),
            );

            if (isEventCallback(cb)) {
                cb(null);
            }
        },
    );

    socket.on(
        buildDomainEventFullName(DomainSubType.PROJECT_NODE_OUT, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(
                socket,
                buildDomainChannelName(DomainSubType.PROJECT_NODE_OUT, target),
            );
        },
    );
}
