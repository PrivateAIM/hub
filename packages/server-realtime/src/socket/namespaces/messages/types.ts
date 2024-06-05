/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MessagesNamespaceCTSMessagesEvents,
    MessagesNamespaceSTCEvents,
} from '@privateaim/core-realtime-kit';
import type { Namespace, Socket } from '@privateaim/server-realtime-kit';

export type MessagesNamespace = Namespace<
MessagesNamespaceCTSMessagesEvents,
MessagesNamespaceSTCEvents
>;

export type MessagesNamespaceSocket = Socket<
MessagesNamespaceCTSMessagesEvents,
MessagesNamespaceSTCEvents
>;
