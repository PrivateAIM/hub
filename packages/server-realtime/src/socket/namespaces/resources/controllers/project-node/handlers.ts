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
    PermissionID,
    buildDomainChannelName,
    buildDomainEventSubscriptionFullName,
    isSocketClientToServerEventCallback,
    isSocketClientToServerEventErrorCallback,
} from '@privateaim/core';
import { UnauthorizedError } from '@ebec/http';
import type {
    ResourcesNamespaceSocket,
} from '../../types';
import {
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '../../../../utils';

export function registerProjectNodeSocketHandlers(socket: ResourcesNamespaceSocket) {
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

            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.PROJECT_NODE, target));

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.PROJECT_NODE, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.PROJECT_NODE, target));
        },
    );
}

export function registerProjectNodeForRealmSocketHandlers(socket: ResourcesNamespaceSocket) {
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

            subscribeSocketRoom(
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
            unsubscribeSocketRoom(
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

            subscribeSocketRoom(
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
            unsubscribeSocketRoom(
                socket,
                buildDomainChannelName(DomainSubType.PROJECT_NODE_OUT, target),
            );
        },
    );
}
