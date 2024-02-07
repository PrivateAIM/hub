/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalyseNodeSocketEventData } from '@privateaim/core';
import {
    DomainEventSubscriptionName,
    DomainType,
    PermissionID,
    buildDomainChannelName,
    buildDomainEventSubscriptionFullName,
    buildSocketRealmNamespaceName,
    isSocketClientToServerEventCallback,
    isSocketClientToServerEventErrorCallback,
} from '@privateaim/core';
import { UnauthorizedError } from '@ebec/http';
import { useAPIClient } from '../../../core';
import type {
    SocketHandlerContext,
} from '../../type';
import {
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '../../utils';
import { buildNodeSocketRoom } from '../node';

export function registerAnalysisSocketHandlers({ socket, server }: SocketHandlerContext) {
    if (!socket.data.userId && !socket.data.robotId) return;

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.ANALYSIS, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (
                !socket.data.ability.has(PermissionID.ANALYSIS_EDIT) &&
                !socket.data.ability.has(PermissionID.ANALYSIS_EXECUTION_START) &&
                !socket.data.ability.has(PermissionID.ANALYSIS_EXECUTION_STOP)
            ) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS, target));

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.ANALYSIS, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS, target));
        },
    );

    socket.on('analysisNodes', async (id, cb) => {
        // todo: might should cache this with redis
        const apiClient = useAPIClient();
        const response = await apiClient.analysisNode.getMany({
            filter: {
                analysis_id: id,
            },
        });

        const data : AnalyseNodeSocketEventData = {};

        for (let i = 0; i < response.data.length; i++) {
            const nodeRoom = buildNodeSocketRoom(response.data[i].node_id);
            const nodeRoomNamespace = server.of(buildSocketRealmNamespaceName(response.data[i].node_realm_id));
            const nodeRoomSockets = nodeRoomNamespace.adapter.rooms.get(nodeRoom);

            data[response.data[i].node_id] = {
                online: nodeRoomSockets.size > 0,
                realmId: response.data[i].node_realm_id,
            };
        }

        cb(null, data);
    });
}
