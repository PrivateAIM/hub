/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildDomainEventFullName } from '@privateaim/kit';
import {
    DomainEventSubscriptionName,
    DomainType,
    buildDomainChannelName,
} from '@privateaim/core-kit';
import {
    isEventCallback,
} from '@privateaim/core-realtime-kit';
import { UnauthorizedError } from '@privateaim/errors';
import {
    isSocketAuthenticated,
    subscribeSocketRoom,
    unsubscribeSocketRoom,
} from '@privateaim/server-realtime-kit';
import { MASTER_IMAGE_READ_PERMISSIONS } from '../../../../core/index.ts';
import type { Socket } from '../../types.ts';

export function registerMasterImageSocketHandlers(socket: Socket) {
    if (!isSocketAuthenticated(socket)) return;

    socket.on(
        buildDomainEventFullName(DomainType.MASTER_IMAGE, DomainEventSubscriptionName.SUBSCRIBE),
        async (target, cb) => {
            // Subscribing requires the same grants as the HTTP read.
            try {
                await socket.data.permissionEvaluator.preEvaluateOneOf({ name: MASTER_IMAGE_READ_PERMISSIONS });
            } catch {
                if (isEventCallback(cb)) {
                    cb(new UnauthorizedError());
                }

                return;
            }

            subscribeSocketRoom(socket, buildDomainChannelName(DomainType.MASTER_IMAGE, target));

            if (isEventCallback(cb)) {
                cb(null);
            }
        },
    );

    socket.on(
        buildDomainEventFullName(DomainType.MASTER_IMAGE, DomainEventSubscriptionName.UNSUBSCRIBE),
        (target) => {
            unsubscribeSocketRoom(socket, buildDomainChannelName(DomainType.MASTER_IMAGE, target));
        },
    );
}
