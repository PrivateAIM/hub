/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { STSEvents, SocketResourcesNamespaceCTSEvents, SocketResourcesNamespaceSTCEvents } from '@privateaim/core-realtime-kit';
import type { Namespace, Socket } from 'socket.io';
import type { SocketData } from '@privateaim/server-realtime-kit';

export type ResourcesNamespace = Namespace<
SocketResourcesNamespaceCTSEvents,
SocketResourcesNamespaceSTCEvents,
STSEvents,
SocketData
>;

export type ResourcesNamespaceSocket = Socket<
SocketResourcesNamespaceCTSEvents,
SocketResourcesNamespaceSTCEvents,
STSEvents,
SocketData
>;
