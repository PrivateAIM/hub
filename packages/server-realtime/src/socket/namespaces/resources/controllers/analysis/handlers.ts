/*
 * Copyright (c) 2021-2024.
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
} from '@privateaim/core';
import { UnauthorizedError } from '@ebec/http';
import type { ResourcesNamespaceSocket } from '../../types';
import {
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '../../../../utils';

export function registerAnalysisSocketHandlers(socket: ResourcesNamespaceSocket) {
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
}
