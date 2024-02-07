/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeSocketServerMessage } from '@privateaim/core';
import {
    DomainEventSubscriptionName,
    DomainType,
    NodeSocketClientEventName,
    NodeSocketServerEventName,
    PermissionID,
    buildDomainChannelName,
    buildDomainEventSubscriptionFullName,
    buildSocketRealmNamespaceName,
    isSocketClientToServerEventCallback,
    isSocketClientToServerEventErrorCallback,
} from '@privateaim/core';
import { UnauthorizedError } from '@ebec/http';
import { useAPIClient } from '../../../core';
import type { SocketHandlerContext } from '../../type';
import { subscribeSocketRoom, unsubscribeSocketRoom } from '../../utils';
import { buildNodeSocketRoom } from './utils';

export function registerNodeSocketHandlers({ socket, server }: SocketHandlerContext) {
    if (!socket.data.userId && !socket.data.robotId) return;

    const apiClient = useAPIClient();

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

    socket.on(
        NodeSocketClientEventName.CONNECT,
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

            // todo: check socket.data.socketRooms size and emit connected

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        NodeSocketClientEventName.DISCONNECT,
        async (cb) => {
            if (socket.data.nodeId) {
                unsubscribeSocketRoom(socket, buildNodeSocketRoom(socket.data.nodeId));
            }

            // todo: check socket.data.socketRooms size and emit disconnected

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        NodeSocketClientEventName.MESSAGE,
        async (data) => {
            const response = await apiClient.node.getMany({
                filters: {
                    id: data.to,
                },
            });

            for (let i = 0; i < response.data.length; i++) {
                const message : NodeSocketServerMessage = {
                    from: socket.data.nodeId,
                    data: data.data,
                    metadata: data.metadata,
                };

                server.of(buildSocketRealmNamespaceName(response.data[i].realm_id))
                    .to(buildNodeSocketRoom(response.data[i].id))
                    .emit(NodeSocketServerEventName.MESSAGE, message);
            }
        },
    );

    // todo: listen for disconnect -> check socket.data.socketRooms
}
