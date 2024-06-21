/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CTSConnectionEvents, STCConnectionEvents } from './connection';
import type { CTSMessagingEvents, STCMessagingEvents } from './messaging';

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

export type STCEvents = STCConnectionEvents & STCMessagingEvents;

export type CTSEvents = CTSConnectionEvents & CTSMessagingEvents;
