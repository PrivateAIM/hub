/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { SocketCTSEventName, SocketSTCEventName } from './constants';

export type SocketSTCEventContext<T extends Record<string, any>> = T & {
    meta: {
        roomName?: string,
        roomId?: string | number
    }
};

export type SocketEventTarget = string | number | undefined;
export interface SocketEventCallback<T = any> {
    (error: Error | null) : void;
    (error: Error | null, data: T) : void;
}

export type SocketSTSEvents = {
    [event: string]: (...args: any[]) => void;
};

export type SocketSTCEvents = {
    [K in `${SocketSTCEventName}`]: (data: SocketSTCEventContext<{id: string}>) => void
};

export type SocketCTSEvents = {
    [K in `${SocketCTSEventName.USER_CONNECTION_SUBSCRIBE}` |
        `${SocketCTSEventName.USER_CONNECTION_UNSUBSCRIBE}` |
        `${SocketCTSEventName.ROBOT_CONNECTION_SUBSCRIBE}` |
        `${SocketCTSEventName.ROBOT_CONNECTION_UNSUBSCRIBE}`
    ]: (
        target: SocketEventTarget,
        cb?: SocketEventCallback<undefined>
    ) => void
} & {
    [K in `${SocketCTSEventName.USER_CONNECTIONS}` | `${SocketCTSEventName.ROBOT_CONNECTIONS}`]: (
        target: SocketEventTarget,
        cb?: SocketEventCallback<number>
    ) => void
};
