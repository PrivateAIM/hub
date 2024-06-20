/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    STSEvents,
    SocketResourcesNamespaceCTSEvents,
    SocketResourcesNamespaceSTCEvents,
} from '@privateaim/core-realtime-kit';
import type {
    SocketData,
} from '@privateaim/server-realtime-kit';
import type {
    Namespace as NamespaceBase,
    Server as ServerBase,
    Socket as SocketBase,
} from 'socket.io';

export type Socket = SocketBase<
SocketResourcesNamespaceCTSEvents,
SocketResourcesNamespaceSTCEvents,
STSEvents,
SocketData
>;

export type Namespace = NamespaceBase<
SocketResourcesNamespaceCTSEvents,
SocketResourcesNamespaceSTCEvents,
STSEvents,
SocketData
>;

export type Server = ServerBase<
SocketResourcesNamespaceCTSEvents,
SocketResourcesNamespaceSTCEvents,
STSEvents,
SocketData
>;
