/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientManager } from '@authup/core-realtime-kit';
import type { SocketResourcesNamespaceCTSEvents, SocketResourcesNamespaceSTCEvents } from '@privateaim/core';
import type { Socket } from 'socket.io-client';

export type SocketClient = Socket<SocketResourcesNamespaceSTCEvents, SocketResourcesNamespaceCTSEvents>;
export type SocketClientManager = ClientManager<SocketResourcesNamespaceSTCEvents, SocketResourcesNamespaceCTSEvents>;

export type SocketManagerInstallOptions = {
    baseURL: string
};
