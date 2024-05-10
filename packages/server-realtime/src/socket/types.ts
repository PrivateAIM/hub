/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Next } from '@authup/server-core-plugin-socket-io';
import type {
    Node,
    SocketCTSEvents,
    SocketSTCEvents,
    SocketSTSEvents,
} from '@privateaim/core';
import type {
    Realm, Robot, User,
} from '@authup/core-kit';
import type { AbilityManager } from '@authup/kit';
import type { Namespace, Server, Socket } from 'socket.io';

export type SocketData = {
    ability?: AbilityManager,

    realmId?: Realm['id'],
    realmName?: Realm['name'],

    userId?: User['id'],
    robotId?: Robot['id'],

    nodeId?: Node['id'],

    namespaceId?: string,
    roomConnections: Record<string, number>,
};

export type SererBase = Server<
SocketCTSEvents,
SocketSTCEvents,
SocketSTSEvents,
SocketData
>;

export type SocketBase = Socket<
SocketCTSEvents,
SocketSTCEvents,
SocketSTSEvents,
SocketData
>;

export type NamespaceBase = Namespace<
SocketCTSEvents,
SocketSTCEvents,
SocketSTSEvents,
SocketData
>;

export type SocketMiddleware = (socket: SocketBase, next: Next) => Promise<void>;
export type SocketNamespaceContext = {
    server: SererBase,
    authMiddleware: SocketMiddleware
};
