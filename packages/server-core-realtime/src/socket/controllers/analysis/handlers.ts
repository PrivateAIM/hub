/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName, buildDomainEventFullName } from '@privateaim/kit';
import {
    DomainEventSubscriptionName,
    DomainType,
    buildDomainChannelName,
} from '@privateaim/core-kit';
import {
    isEventCallback,
} from '@privateaim/core-realtime-kit';
import { UnauthorizedError } from '@ebec/http';
import {
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '@privateaim/server-realtime-kit';
import type { Socket } from '../../types';

export function registerAnalysisSocketHandlers(socket: Socket) {
    if (!socket.data.userId && !socket.data.robotId) return;

    socket.on(
        buildDomainEventFullName(DomainType.ANALYSIS, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            try {
                await socket.data.permissionChecker.preCheckOneOf({
                    name: [
                        PermissionName.ANALYSIS_UPDATE,
                        PermissionName.ANALYSIS_EXECUTION_START,
                        PermissionName.ANALYSIS_EXECUTION_STOP,
                    ],
                });
            } catch (e) {
                if (isEventCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS, target));

            if (isEventCallback(cb)) {
                cb(null);
            }
        },
    );

    socket.on(
        buildDomainEventFullName(DomainType.ANALYSIS, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS, target));
        },
    );
}
