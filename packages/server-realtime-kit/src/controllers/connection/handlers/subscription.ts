/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { CTSEventName } from '@privateaim/core-realtime-kit';
import type { Socket } from '../../../types';
import {
    buildConnectionRobotRoom,
    buildConnectionRobotSubscriptionRoom,
    buildConnectionUserRoom,
    buildConnectionUserSubscriptionRoom,
} from '../utils';

export function mountConnectionSubscriptionHandlers(socket: Socket) {
    socket.on(CTSEventName.USER_CONNECTIONS, (
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

        const sockets = socket.nsp.adapter.rooms.get(buildConnectionUserRoom(target));

        if (typeof cb === 'function') {
            cb(null, sockets.size);
        }
    });

    socket.on(CTSEventName.USER_CONNECTION_SUBSCRIBE, (
        target,
    ) => {
        if (typeof target === 'undefined') {
            return;
        }

        socket.join(buildConnectionUserSubscriptionRoom(target));
    });

    socket.on(CTSEventName.USER_CONNECTION_UNSUBSCRIBE, (
        target,
    ) => {
        if (typeof target === 'undefined') {
            return;
        }

        socket.leave(buildConnectionUserSubscriptionRoom(target));
    });

    // ----------------------------------------------------------

    socket.on(CTSEventName.ROBOT_CONNECTIONS, (
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

        const sockets = socket.nsp.adapter.rooms.get(buildConnectionRobotRoom(target));

        if (typeof cb === 'function') {
            cb(null, sockets.size);
        }
    });

    socket.on(CTSEventName.ROBOT_CONNECTION_SUBSCRIBE, (
        target,
    ) => {
        if (typeof target === 'undefined') {
            return;
        }

        socket.join(buildConnectionRobotSubscriptionRoom(target));
    });

    socket.on(CTSEventName.ROBOT_CONNECTION_UNSUBSCRIBE, (
        target,
    ) => {
        if (typeof target === 'undefined') {
            return;
        }

        socket.leave(buildConnectionRobotSubscriptionRoom(target));
    });
}
