/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { STCEventName } from '@privateaim/core-realtime-kit';
import type { Socket } from '../../../types';
import {
    buildConnectionRobotRoom,
    buildConnectionRobotSubscriptionRoom,
    buildConnectionUserRoom,
    buildConnectionUserSubscriptionRoom,
} from '../utils';

export function mountConnectionConnectHandler(socket: Socket) {
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
    if (sockets && sockets.size > 1) {
        return;
    }

    if (socket.data.userId) {
        socket.nsp.in(buildConnectionUserSubscriptionRoom(socket.data.userId)).emit(
            STCEventName.USER_CONNECTED,
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
            STCEventName.ROBOT_CONNECTED,
            {
                id: socket.data.robotId,
                meta: {
                    roomName: buildConnectionRobotSubscriptionRoom(socket.data.robotId),
                },
            },
        );
    }
}
