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
import { PermissionName, buildDomainEventFullName } from '@privateaim/kit';
import {
    isEventCallback,
} from '@privateaim/core-realtime-kit';
import { UnauthorizedError } from '@ebec/http';
import {
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '@privateaim/server-realtime-kit';
import type {
    Socket,
} from '../../types.ts';

export function registerAnalysisNodeSocketHandlers(socket: Socket) {
    if (!socket.data.userId && !socket.data.robotId) return;

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventFullName(DomainType.ANALYSIS_NODE, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            try {
                await socket.data.permissionChecker.preCheckOneOf({
                    name: [
                        PermissionName.ANALYSIS_APPROVE,
                    ],
                });
            } catch (e) {
                if (isEventCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS_NODE, target));

            if (isEventCallback(cb)) {
                cb(null);
            }
        },
    );

    socket.on(
        buildDomainEventFullName(DomainType.ANALYSIS_NODE, DomainEventSubscriptionName.SUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS_NODE, target));
        },
    );
}

export function registerAnalysisNodeForRealmSocketHandlers(socket: Socket) {
    if (!socket.data.userId && !socket.data.robotId) return;

    // ------------------------------------------------------------

    socket.on(
        buildDomainEventFullName(DomainSubType.ANALYSIS_NODE_IN, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            try {
                await socket.data.permissionChecker.preCheckOneOf({
                    name: [
                        PermissionName.ANALYSIS_APPROVE,
                    ],
                });
            } catch (e) {
                if (isEventCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainSubType.ANALYSIS_NODE_IN, target));

            if (isEventCallback(cb)) {
                cb(null);
            }
        },
    );

    socket.on(
        buildDomainEventFullName(DomainSubType.ANALYSIS_NODE_IN, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainSubType.ANALYSIS_NODE_IN, target));
        },
    );

    // ----------------------------------------------------------

    socket.on(
        buildDomainEventFullName(DomainSubType.ANALYSIS_NODE_OUT, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            try {
                await socket.data.permissionChecker.preCheckOneOf({
                    name: [
                        PermissionName.ANALYSIS_UPDATE,
                    ],
                });
            } catch (e) {
                if (isEventCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainSubType.ANALYSIS_NODE_OUT, target));

            if (isEventCallback(cb)) {
                cb(null);
            }
        },
    );

    socket.on(
        buildDomainEventFullName(DomainSubType.ANALYSIS_NODE_OUT, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainSubType.ANALYSIS_NODE_OUT, target));
        },
    );
}
