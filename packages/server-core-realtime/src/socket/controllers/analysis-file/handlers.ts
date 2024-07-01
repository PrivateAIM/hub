/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DomainEventSubscriptionName,
    DomainType,
    buildDomainChannelName,
    buildDomainEventSubscriptionFullName,
} from '@privateaim/core-kit';
import {
    isEventCallback,
} from '@privateaim/core-realtime-kit';
import { UnauthorizedError } from '@ebec/http';
import { PermissionName } from '@privateaim/kit';
import {
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '@privateaim/server-realtime-kit';
import type {
    Socket,
} from '../../types';

export function registerAnalysisFileSocketHandlers(socket: Socket) {
    if (!socket.data.userId && !socket.data.robotId) return;

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.ANALYSIS_BUCKET_FILE, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            if (!socket.data.abilities.has(PermissionName.ANALYSIS_UPDATE)) {
                if (isEventCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS_BUCKET_FILE, target));

            if (isEventCallback(cb)) {
                cb(null);
            }
        },
    );

    socket.on(
        buildDomainEventSubscriptionFullName(DomainType.ANALYSIS_BUCKET_FILE, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS_BUCKET_FILE, target));
        },
    );
}
