/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Socket } from '../../../types.ts';
import {
    buildConnectionRoomForIdentity, buildDisconnectedEventNameForIdentity,
    buildSubscriptionRoomForIdentity,
} from '../helpers.ts';

export function mountSocketConnectionDisconnectingHandler(socket: Socket) {
    socket.on('disconnecting', () => {
        if (!socket.data.identity) {
            return;
        }

        const roomName = buildConnectionRoomForIdentity(socket.data.identity);
        socket.leave(roomName);

        const sockets = socket.nsp.adapter.rooms.get(roomName);
        if (sockets && sockets.size !== 0) {
            return;
        }

        socket.nsp.in(buildSubscriptionRoomForIdentity(socket.data.identity)).emit(
            buildDisconnectedEventNameForIdentity(socket.data.identity),
            {
                id: socket.data.identity.id,
                meta: {
                    roomName: buildConnectionRoomForIdentity(socket.data.identity),
                },
            },
        );
    });
}
