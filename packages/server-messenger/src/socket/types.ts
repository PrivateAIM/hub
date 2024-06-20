/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Server as ServerBase, Socket as SocketBase } from '@privateaim/server-realtime-kit';
import type {
    CTSConnectionEvents,
    CTSMessagingEvents,
    STCConnectionEvents,
    STCMessagingEvents,
} from './controllers';

export type STCEventContext<T extends Record<string, any>> = T & {
    meta: {
        roomName?: string,
        roomId?: string | number
    }
};

export type EventTarget = string | number | undefined;
export interface EventCallback<T = any> {
    (error: Error | null) : void;
    (error: Error | null, data: T) : void;
}

export type Socket = SocketBase<
CTSMessagingEvents & CTSConnectionEvents,
STCMessagingEvents & STCConnectionEvents
>;

export type Server = ServerBase<
CTSMessagingEvents & CTSConnectionEvents,
STCMessagingEvents & STCConnectionEvents
>;
