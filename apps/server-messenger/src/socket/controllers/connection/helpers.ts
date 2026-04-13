/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { STCConnectionEventName } from '@privateaim/messenger-kit';
import type { SocketIdentity } from '@privateaim/server-realtime-kit';

export function buildConnectedEventNameForIdentity(socket: Pick<SocketIdentity, 'type' | 'id'>) {
    switch (socket.type) {
        case 'client':
            return STCConnectionEventName.CLIENT_CONNECTED;
        case 'robot':
            return STCConnectionEventName.ROBOT_CONNECTED;
        case 'user':
        default:
            return STCConnectionEventName.USER_CONNECTED;
    }
}

export function buildDisconnectedEventNameForIdentity(socket: Pick<SocketIdentity, 'type' | 'id'>) {
    switch (socket.type) {
        case 'client':
            return STCConnectionEventName.CLIENT_DISCONNECTED;
        case 'robot':
            return STCConnectionEventName.ROBOT_DISCONNECTED;
        case 'user':
        default:
            return STCConnectionEventName.USER_DISCONNECTED;
    }
}

export function buildSubscriptionRoomForIdentity(socket: Pick<SocketIdentity, 'type' | 'id'>) {
    switch (socket.type) {
        case 'client':
            return `client-connection-subscription:${socket.id}`;
        case 'robot':
            return `robot-connection-subscription:${socket.id}`;
        case 'user':
        default:
            return `user-connection-subscription:${socket.id}`;
    }
}

export function buildConnectionRoomForIdentity(socket: Pick<SocketIdentity, 'type' | 'id'>) {
    switch (socket.type) {
        case 'client':
            return `client-connection:${socket.id}`;
        case 'robot':
            return `robot-connection:${socket.id}`;
        case 'user':
        default:
            return `user-connection:${socket.id}`;
    }
}
