/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Socket } from '../types';

export function subscribeSocketRoom(
    socket: Socket,
    roomName: string,
) {
    if (!socket.data.roomSubscriptions) {
        socket.data.roomSubscriptions = {};
    }

    if (!socket.data.roomSubscriptions[roomName]) {
        socket.data.roomSubscriptions[roomName] = 0;
    }

    socket.data.roomSubscriptions[roomName]++;

    socket.join(roomName);
}

export function unsubscribeSocketRoom(
    socket: Socket,
    roomName: string,
) {
    if (!socket.data.roomSubscriptions) {
        return;
    }

    if (socket.data.roomSubscriptions[roomName]) {
        if (socket.data.roomSubscriptions[roomName] > 1) {
            socket.data.roomSubscriptions[roomName]--;
        } else {
            delete socket.data.roomSubscriptions[roomName];
        }
    }

    if (!socket.data.roomSubscriptions[roomName]) {
        socket.leave(roomName);
    }
}
