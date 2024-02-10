import { SocketCTSEventName } from '@privateaim/core';
import type { SocketBase } from '../../../types';
import { buildConnectionRobotSubscriptionRoom, buildConnectionUserSubscriptionRoom } from '../utils';

export function registerSocketConnectionSubscriptionHandlers(socket: SocketBase) {
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
