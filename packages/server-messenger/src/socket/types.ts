/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MessagesNamespaceCTSMessagesEvents, MessagesNamespaceSTCEvents } from '@privateaim/core-realtime-kit';
import type {
    Server as ServerBase, Socket as SocketBase,
} from '@privateaim/server-realtime-kit';

export type Socket = SocketBase<
MessagesNamespaceCTSMessagesEvents,
MessagesNamespaceSTCEvents
>;

export type Server = ServerBase<
MessagesNamespaceCTSMessagesEvents,
MessagesNamespaceSTCEvents
>;
