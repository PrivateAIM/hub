import { SocketSTCEventName } from '@privateaim/core';
import type { SocketBase } from '../../../types';
import {
    buildConnectionRobotRoom, buildConnectionUserRoom,
    buildConnectionRobotSubscriptionRoom,
    buildConnectionUserSubscriptionRoom
} from '../utils';

export function registerSocketConnectionConnectHandler(socket: SocketBase) {
    if (!socket.data.userId && !socket.data.robotId) {
        return;
    }

    let roomName : string;
    if (socket.data.userId) {
        roomName = buildConnectionUserRoom(socket.data.userId);
    } else {
        roomName = buildConnectionRobotRoom(socket.data.robotId);
    }

    socket.join(roomName);

    const sockets = socket.nsp.adapter.rooms.get(roomName);
    if (sockets.size !== 1) {
        return;
    }

    if (socket.data.userId) {
        socket.nsp.in(buildConnectionUserSubscriptionRoom(socket.data.userId)).emit(
            SocketSTCEventName.USER_CONNECTED,
            {
                id: socket.data.userId,
                meta: {
                    roomName: buildConnectionUserSubscriptionRoom(socket.data.userId),
                },
            },
        );

        return;
    }

    if (socket.data.robotId) {
        socket.nsp.in(buildConnectionRobotSubscriptionRoom(socket.data.robotId)).emit(
            SocketSTCEventName.ROBOT_CONNECTED,
            {
                id: socket.data.robotId,
                meta: {
                    roomName: buildConnectionRobotSubscriptionRoom(socket.data.robotId),
                },
            },
        );
    }
}
