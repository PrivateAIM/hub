/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DomainEventSubscriptionName,
    DomainSubType,
    DomainType,
    PermissionID,
    buildDomainChannelName,
    buildDomainEventSubscriptionFullName,
    isSocketClientToServerEventCallback,
    isSocketClientToServerEventErrorCallback,
} from '@personalhealthtrain/core';
import { UnauthorizedError } from '@ebec/http';
import type {
    SocketInterface,
    SocketNamespaceInterface,
    SocketServerInterface,
} from '../../type';
import {
    decrSocketRoomConnections,
    incrSocketRoomConnections,
} from '../../utils';

export function registerProposalStationSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.userId && !socket.data.robotId) return;

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.PROJECT_NODE, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (
                !socket.data.ability.has(PermissionID.PROPOSAL_APPROVE)
            ) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            incrSocketRoomConnections(socket, buildDomainChannelName(DomainType.PROJECT_NODE, target));

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.PROJECT_NODE, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            decrSocketRoomConnections(socket, buildDomainChannelName(DomainType.PROJECT_NODE, target));
        },
    );
}

export function registerProposalStationForRealmSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.userId && !socket.data.robotId) return;

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.PROJECT_NODE_IN, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (
                !socket.data.ability.has(PermissionID.PROPOSAL_APPROVE)
            ) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            incrSocketRoomConnections(
                socket,
                buildDomainChannelName(DomainSubType.PROJECT_NODE_IN, target),
            );

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.PROJECT_NODE_IN, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            decrSocketRoomConnections(
                socket,
                buildDomainChannelName(DomainSubType.PROJECT_NODE_IN, target),
            );
        },
    );

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.PROJECT_NODE_OUT, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (
                !socket.data.ability.has(PermissionID.PROJECT_EDIT)
            ) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            incrSocketRoomConnections(
                socket,
                buildDomainChannelName(DomainSubType.PROJECT_NODE_OUT, target),
            );

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.PROJECT_NODE_OUT, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            decrSocketRoomConnections(
                socket,
                buildDomainChannelName(DomainSubType.PROJECT_NODE_OUT, target),
            );
        },
    );
}
