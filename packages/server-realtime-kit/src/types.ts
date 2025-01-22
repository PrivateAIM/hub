/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, Robot, User } from '@authup/core-kit';
import type { PermissionChecker } from '@authup/access';
import type {
    Namespace as _Namespace,
    Server as _Server,
    Socket as _Socket,
} from 'socket.io';

export type SocketData = {
    permissionChecker?: PermissionChecker,

    realmId?: Realm['id'],
    realmName?: Realm['name'],

    userId?: User['id'],
    userName?: User['name'],

    robotId?: Robot['id'],
    robotName?: Robot['name'],

    namespaceId?: string,
    roomSubscriptions: Record<string, number>,
};

export interface EventsMap {
    [p: string]: any
}

export interface DefaultEventsMap {
    [p: string]: (...args: any[]) => void
}

export type Server<
    ListenEvents extends EventsMap = DefaultEventsMap,
    EmitEvents extends EventsMap = ListenEvents,
    ServerSideEvents extends EventsMap = DefaultEventsMap,
    Data extends SocketData = SocketData,
> = _Server<ListenEvents, EmitEvents, ServerSideEvents, Data>;

export type Socket<
    ListenEvents extends EventsMap = DefaultEventsMap,
    EmitEvents extends EventsMap = ListenEvents,
    ServerSideEvents extends EventsMap = DefaultEventsMap,
    Data extends SocketData = SocketData,
> = _Socket<ListenEvents, EmitEvents, ServerSideEvents, Data>;

export type Namespace<
    ListenEvents extends EventsMap = DefaultEventsMap,
    EmitEvents extends EventsMap = ListenEvents,
    ServerSideEvents extends EventsMap = DefaultEventsMap,
    Data extends SocketData = SocketData,
> = _Namespace<ListenEvents, EmitEvents, ServerSideEvents, Data>;

export type Middleware<
    ListenEvents extends EventsMap = DefaultEventsMap,
    EmitEvents extends EventsMap = ListenEvents,
    ServerSideEvents extends EventsMap = DefaultEventsMap,
    Data extends SocketData = SocketData,
> = (
    socket: Socket<ListenEvents, EmitEvents, ServerSideEvents, Data>,
    next: (err?: Error) => void
) => void | Promise<void>;
