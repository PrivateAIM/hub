/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { CTSConnectionEventName } from '@privateaim/messenger-kit';
import type { Socket } from '../../../types.ts';
import {
    buildConnectionRoomForIdentity,
    buildSubscriptionRoomForIdentity,
} from '../helpers.ts';

export function mountConnectionSubscriptionHandlers(socket: Socket) {
    socket.on(CTSConnectionEventName.USER_CONNECTIONS, (
        target,
        cb,
    ) => {
        if (typeof target === 'undefined') {
            if (typeof cb === 'function') {
                // todo: custom error class with code
                cb(new Error('Target is invalid'));
            }
            return;
        }

        const sockets = socket.nsp.adapter.rooms.get(buildConnectionRoomForIdentity({ type: 'user', id: `${target}` }));

        if (typeof cb === 'function') {
            cb(null, sockets.size);
        }
    });

    socket.on(CTSConnectionEventName.USER_CONNECTION_SUBSCRIBE, (
        target,
    ) => {
        if (typeof target === 'undefined') {
            return;
        }

        socket.join(buildSubscriptionRoomForIdentity({ type: 'user', id: `${target}` }));
    });

    socket.on(CTSConnectionEventName.USER_CONNECTION_UNSUBSCRIBE, (
        target,
    ) => {
        if (typeof target === 'undefined') {
            return;
        }

        socket.leave(buildSubscriptionRoomForIdentity({ type: 'user', id: `${target}` }));
    });

    // ----------------------------------------------------------

    socket.on(CTSConnectionEventName.ROBOT_CONNECTIONS, (
        target,
        cb,
    ) => {
        if (typeof target === 'undefined') {
            if (typeof cb === 'function') {
                // todo: custom error class with code
                cb(new Error('Target is invalid'));
            }
            return;
        }

        const sockets = socket.nsp.adapter.rooms.get(buildConnectionRoomForIdentity({ type: 'robot', id: `${target}` }));

        if (typeof cb === 'function') {
            cb(null, sockets.size);
        }
    });

    socket.on(CTSConnectionEventName.ROBOT_CONNECTION_SUBSCRIBE, (
        target,
    ) => {
        if (typeof target === 'undefined') {
            return;
        }

        socket.join(buildSubscriptionRoomForIdentity({ type: 'robot', id: `${target}` }));
    });

    socket.on(CTSConnectionEventName.ROBOT_CONNECTION_UNSUBSCRIBE, (
        target,
    ) => {
        if (typeof target === 'undefined') {
            return;
        }

        socket.leave(buildSubscriptionRoomForIdentity({ type: 'robot', id: `${target}` }));
    });
}
