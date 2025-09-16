/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DomainEventFullName } from '@privateaim/kit';
import type {
    DomainEventName,
    DomainEventSubscriptionName,
    DomainTypeMap,
} from '@privateaim/core-kit';

export type STCEventRecord<
    TYPE extends string,
    RECORD extends Record<string, any>,
> = {
    data: RECORD,
    meta: {
        event: `${DomainEventName}`,
        refType: TYPE,
        refId?: string,
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

export type STCEventHandler<
    TYPE extends string,
    RECORD extends Record<string, any>,
> = (
    data: STCEventRecord<TYPE, RECORD>
) => void;
export type STCEvents = {
    [K in keyof DomainTypeMap as DomainEventFullName<K, DomainEventName>]: STCEventHandler<K, DomainTypeMap[K]>
} & {
    pong: () => void
};

export type CTSEventHandler = (
    target: EventTarget,
    cb: EventCallback
) => void;

export type CTSEvents = {
    [K in keyof DomainTypeMap as DomainEventFullName<K, DomainEventSubscriptionName>]: CTSEventHandler
} & {
    ping: () => void
};
