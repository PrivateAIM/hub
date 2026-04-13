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
    isSocketAuthenticated,
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '@privateaim/server-realtime-kit';
import type {
    Socket,
} from '../../types.ts';

export function registerAnalysisFileSocketHandlers(socket: Socket) {
    if (!isSocketAuthenticated(socket)) return;

    socket.on(
        buildDomainEventFullName(DomainType.ANALYSIS_BUCKET_FILE, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            try {
                await socket.data.permissionChecker.preEvaluateOneOf({
                    name: [
                        PermissionName.ANALYSIS_UPDATE,
                    ],
                });
            } catch {
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
        buildDomainEventFullName(DomainType.ANALYSIS_BUCKET_FILE, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS_BUCKET_FILE, target));
        },
    );
}
