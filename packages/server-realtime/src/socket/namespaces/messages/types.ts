/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    SocketMessagesNamespaceCTSMessagesEvents,
    SocketMessagesNamespaceSTCEvents,
    SocketSTSEvents,
} from '@privateaim/core';
import type { Namespace, Socket } from 'socket.io';
import type { SocketData } from '../../types';

export type MessagesNamespace = Namespace<
SocketMessagesNamespaceCTSMessagesEvents,
SocketMessagesNamespaceSTCEvents,
SocketSTSEvents,
SocketData
>;

export type MessagesNamespaceSocket = Socket<
SocketMessagesNamespaceCTSMessagesEvents,
SocketMessagesNamespaceSTCEvents,
SocketSTSEvents,
SocketData
>;
