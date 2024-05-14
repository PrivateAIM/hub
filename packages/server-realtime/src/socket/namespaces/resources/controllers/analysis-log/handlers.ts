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
import type {
    ResourcesNamespaceSocket,
} from '../../types';
import {
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '../../../../utils';

export function registerAnalysisLogSocketHandlers(socket: ResourcesNamespaceSocket) {
    if (!socket.data.userId && !socket.data.robotId) return;

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.ANALYSIS_LOG, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (!socket.data.abilities.has(PermissionID.ANALYSIS_EDIT)) {
                if (isSocketClientToServerEventErrorCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS_LOG, target));

            if (isSocketClientToServerEventCallback(cb)) {
                cb();
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.ANALYSIS_LOG, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS_LOG, target));
        },
    );
}
