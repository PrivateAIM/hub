/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientManager } from '@authup/core-realtime-kit';
import type { CTSEvents, STCEvents } from '@privateaim/core-realtime-kit';
import type { Socket } from 'socket.io-client';

export type SocketClient = Socket<STCEvents, CTSEvents>;
export type SocketClientManager = ClientManager<STCEvents, CTSEvents>;

export type SocketManagerInstallOptions = {
    baseURL: string
};
