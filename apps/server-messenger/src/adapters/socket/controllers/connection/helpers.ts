/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { STCConnectionEventName } from '@privateaim/messenger-kit';
import type { SocketIdentity } from '@privateaim/server-realtime-kit';
import type { ConnectionRoomParty } from './types.ts';

export function buildConnectedEventNameForIdentity(socket: Pick<SocketIdentity, 'type' | 'id'>) {
    switch (socket.type) {
        case 'client':
            return STCConnectionEventName.CLIENT_CONNECTED;
        case 'user':
        default:
            return STCConnectionEventName.USER_CONNECTED;
    }
}

export function buildDisconnectedEventNameForIdentity(socket: Pick<SocketIdentity, 'type' | 'id'>) {
    switch (socket.type) {
        case 'client':
            return STCConnectionEventName.CLIENT_DISCONNECTED;
        case 'user':
        default:
            return STCConnectionEventName.USER_DISCONNECTED;
    }
}

// Room names embed the party type verbatim. A recipient whose type no socket
// identity has (e.g. `robot`) therefore gets its own room, which stays empty,
// instead of falling through to another type's room.

export function buildSubscriptionRoomForIdentity(party: ConnectionRoomParty) {
    return `${party.type}-connection-subscription:${party.id}`;
}

export function buildConnectionRoomForIdentity(party: ConnectionRoomParty) {
    return `${party.type}-connection:${party.id}`;
}
