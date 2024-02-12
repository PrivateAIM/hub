import { SocketCTSEventName } from '@privateaim/core';
import type { SocketBase } from '../../../types';
import {
    buildConnectionRobotRoom,
    buildConnectionRobotSubscriptionRoom,
    buildConnectionUserRoom,
    buildConnectionUserSubscriptionRoom,
} from '../utils';

export function registerSocketConnectionSubscriptionHandlers(socket: SocketBase) {
    socket.on(SocketCTSEventName.USER_CONNECTIONS, (
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

    socket.on(SocketCTSEventName.USER_CONNECTION_SUBSCRIBE, (
        target,
    ) => {
        if (typeof target === 'undefined') {
            return;
        }

        socket.join(buildConnectionUserSubscriptionRoom(target));
    });

    socket.on(SocketCTSEventName.USER_CONNECTION_UNSUBSCRIBE, (
        target,
    ) => {
        if (typeof target === 'undefined') {
            return;
        }

        socket.leave(buildConnectionUserSubscriptionRoom(target));
    });

    // ----------------------------------------------------------

    socket.on(SocketCTSEventName.ROBOT_CONNECTIONS, (
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

    socket.on(SocketCTSEventName.ROBOT_CONNECTION_SUBSCRIBE, (
        target,
    ) => {
        if (typeof target === 'undefined') {
            return;
        }

        socket.join(buildConnectionRobotSubscriptionRoom(target));
    });

    socket.on(SocketCTSEventName.ROBOT_CONNECTION_UNSUBSCRIBE, (
        target,
    ) => {
        if (typeof target === 'undefined') {
            return;
        }

        socket.join(buildConnectionRobotSubscriptionRoom(target));
    });
}
