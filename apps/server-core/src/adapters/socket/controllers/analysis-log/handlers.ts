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
} from '@privateaim/core-kit';
import {
    isEventCallback,
} from '@privateaim/core-realtime-kit';
import { PermissionName, buildDomainEventFullName } from '@privateaim/kit';
import {
    isSocketAuthenticated,
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '@privateaim/server-realtime-kit';
import { buildSocketSubscribeError } from '../../error.ts';
import { assertSocketSubscribeReach } from '../../reach.ts';
import type {
    Socket,
} from '../../types.ts';

export function registerAnalysisLogSocketHandlers(socket: Socket) {
    if (!isSocketAuthenticated(socket)) return;

    socket.on(
        buildDomainEventFullName(DomainType.ANALYSIS_LOG, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            try {
                await assertSocketSubscribeReach(socket.data, [
                    PermissionName.ANALYSIS_UPDATE,
                ]);
            } catch (e) {
                if (isEventCallback(cb)) {
                    cb(buildSocketSubscribeError(e));
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS_LOG, target));

            if (isEventCallback(cb)) {
                cb(null);
            }
        },
    );

    socket.on(
        buildDomainEventFullName(DomainType.ANALYSIS_LOG, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.ANALYSIS_LOG, target));
        },
    );
}
