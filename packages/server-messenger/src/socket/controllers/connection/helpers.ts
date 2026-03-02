/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { SocketIdentity } from '@privateaim/server-realtime-kit';

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
