/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Socket } from '../../../types.ts';
import {
    buildConnectedEventNameForIdentity,
    buildConnectionRoomForIdentity,
    buildSubscriptionRoomForIdentity,
} from '../helpers.ts';

export function mountConnectionConnectHandler(socket: Socket) {
    if (!socket.data.identity) {
        return;
    }

    const roomName = buildConnectionRoomForIdentity(socket.data.identity);
    socket.join(roomName);

    const sockets = socket.nsp.adapter.rooms.get(roomName);
    if (sockets && sockets.size > 1) {
        return;
    }

    socket.nsp.in(buildSubscriptionRoomForIdentity(socket.data.identity)).emit(
        buildConnectedEventNameForIdentity(socket.data.identity),
        {
            id: socket.data.identity.id,
            meta: { roomName: buildSubscriptionRoomForIdentity(socket.data.identity) },
        },
    );
}
