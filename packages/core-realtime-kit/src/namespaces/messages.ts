/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { SocketCTSEvents, SocketEventCallback, SocketSTCEvents } from '../types';

export type SocketMessagesNamespaceMessageParty = {
    type: 'user' | 'robot',
    id: string
};

export type SocketMessagesNamespaceSTCMessage = {
    from: SocketMessagesNamespaceMessageParty,
    data: Record<string, any>,
    metadata: Record<string, any>
};

export type SocketMessagesNamespaceSTCEvents = SocketSTCEvents & {
    send: (data: SocketMessagesNamespaceSTCMessage) => void
};

export type SocketMessagesNamespaceCTSMessage = {
    to: SocketMessagesNamespaceMessageParty[],
    data: Record<string, any>,
    metadata: Record<string, any>
};

export type SocketMessagesNamespaceCTSMessagesEvents = SocketCTSEvents & {
    send: (data: SocketMessagesNamespaceCTSMessage, cb?: SocketEventCallback) => void;
};
