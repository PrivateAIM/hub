/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DomainEventSubscriptionName,
    DomainType,
    PermissionID,
    buildDomainChannelName,
    buildDomainEventSubscriptionFullName,
    isSocketClientToServerEventCallback,
    isSocketClientToServerEventErrorCallback,
} from '@personalhealthtrain/core';
import { UnauthorizedError } from '@ebec/http';
import { useAPIClient } from '../../../core';
import type { SocketInterface, SocketNamespaceInterface, SocketServerInterface } from '../../type';
import { subscribeSocketRoom, unsubscribeSocketRoom } from '../../utils';
import { NodeSocketEventName } from './constants';
import { buildNodeSocketRoom } from './utils';

export function registerNodeSocketHandlers(
    io: SocketServerInterface | SocketNamespaceInterface,
    socket: SocketInterface,
) {
    if (!socket.data.userId && !socket.data.robotId) return;

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.NODE, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (
                !socket.data.ability.has(PermissionID.NODE_EDIT)
            ) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.NODE, target));

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.NODE, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.NODE, target));
        },
    );

    const apiClient = useAPIClient();

    socket.on(
        NodeSocketEventName.REGISTER,
        async (cb) => {
            if (!socket.data.robotId) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                // todo: error with custom error code
                    cb(new Error('Only robot accounts are permitted for this event.'));
                }

                return;
            }

            if (socket.data.nodeId) {
                subscribeSocketRoom(socket, buildNodeSocketRoom(socket.data.nodeId));
                return;
            }

            const response = await apiClient.node.getMany({
                filters: {
                    robot_id: socket.data.robotId,
                },
                page: {
                    limit: 1,
                },
            });

            const [node] = response.data;

            if (typeof node === 'undefined') {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    // todo: error with custom error code
                    cb(new Error('No node is associated to the current robot account.'));
                }

                return;
            }

            socket.data.nodeId = node.id;

            subscribeSocketRoom(socket, buildNodeSocketRoom(node.id));

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        NodeSocketEventName.UNREGISTER,
        async (cb) => {
            if (socket.data.nodeId) {
                unsubscribeSocketRoom(socket, buildNodeSocketRoom(socket.data.nodeId));
            }

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );
}
