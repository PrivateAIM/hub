/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    SocketClientToServerEvents,
    SocketInterServerEvents,
    SocketServerToClientEvents,
    User,
} from '@personalhealthtrain/ui-common';
import { AbilityManager, PermissionItem } from '@typescript-auth/core';
import { Server, Socket } from 'socket.io';

export type SocketDataInterface = {
    user?: User,
    userId?: typeof User.prototype.id,
    permissions?: PermissionItem<any>[],
    ability?: AbilityManager,
};

export type SocketServerInterface = Server<
SocketClientToServerEvents,
SocketServerToClientEvents,
SocketInterServerEvents,
SocketDataInterface
>;

export type SocketInterface = Socket<
SocketClientToServerEvents,
SocketServerToClientEvents,
SocketInterServerEvents,
SocketDataInterface
>;
