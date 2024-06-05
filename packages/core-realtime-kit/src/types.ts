/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CTSEventName, STCEventName } from './constants';

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

export type STSEvents = {
    [event: string]: (...args: any[]) => void;
};

export type STCEvents = {
    [K in `${STCEventName}`]: (data: STCEventContext<{id: string}>) => void
};

export type CTSEvents = {
    [K in `${CTSEventName.USER_CONNECTION_SUBSCRIBE}` |
        `${CTSEventName.USER_CONNECTION_UNSUBSCRIBE}` |
        `${CTSEventName.ROBOT_CONNECTION_SUBSCRIBE}` |
        `${CTSEventName.ROBOT_CONNECTION_UNSUBSCRIBE}`
    ]: (
        target: EventTarget,
        cb?: EventCallback<undefined>
    ) => void
} & {
    [K in `${CTSEventName.USER_CONNECTIONS}` | `${CTSEventName.ROBOT_CONNECTIONS}`]: (
        target: EventTarget,
        cb?: EventCallback<number>
    ) => void
};
