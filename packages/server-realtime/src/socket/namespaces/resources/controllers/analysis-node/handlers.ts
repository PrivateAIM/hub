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
} from '@privateaim/core';
import { UnauthorizedError } from '@ebec/http';
import type {
    ResourcesNamespaceSocket,
} from '../../types';
import {
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '../../../../utils';

export function registerAnalysisNodeSocketHandlers(socket: ResourcesNamespaceSocket) {
    if (!socket.data.userId && !socket.data.robotId) return;

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.ANALYSIS_NODE, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (
                !socket.data.ability.has(PermissionID.ANALYSIS_APPROVE)
            ) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS_NODE, target));

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.ANALYSIS_NODE, DomainEventSubscriptionName.SUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS_NODE, target));
        },
    );
}

export function registerAnalysisNodeForRealmSocketHandlers(socket: ResourcesNamespaceSocket) {
    if (!socket.data.userId && !socket.data.robotId) return;

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.ANALYSIS_NODE_IN, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (
                !socket.data.ability.has(PermissionID.ANALYSIS_APPROVE)
            ) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainSubType.ANALYSIS_NODE_IN, target));

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.ANALYSIS_NODE_IN, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainSubType.ANALYSIS_NODE_IN, target));
        },
    );

    // ----------------------------------------------------------

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.ANALYSIS_NODE_OUT, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (!socket.data.ability.has(PermissionID.ANALYSIS_EDIT)) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainSubType.ANALYSIS_NODE_OUT, target));

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainSubType.ANALYSIS_NODE_OUT, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainSubType.ANALYSIS_NODE_OUT, target));
        },
    );
}
