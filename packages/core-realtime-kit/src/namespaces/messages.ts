/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CTSEvents, EventCallback, STCEvents } from '../types';

export type MessagesNamespaceMessageParty = {
    type: 'user' | 'robot',
    id: string
};

export type MessagesNamespaceSTCMessage = {
    from: MessagesNamespaceMessageParty,
    data: Record<string, any>,
    metadata: Record<string, any>
};

export type MessagesNamespaceSTCEvents = STCEvents & {
    send: (data: MessagesNamespaceSTCMessage) => void
};

export type MessagesNamespaceCTSMessage = {
    to: MessagesNamespaceMessageParty[],
    data: Record<string, any>,
    metadata: Record<string, any>
};

export type MessagesNamespaceCTSMessagesEvents = CTSEvents & {
    send: (data: MessagesNamespaceCTSMessage, cb?: EventCallback) => void;
};
