/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    DomainEventContext,
    DomainEventFullName,
    DomainEventSubscriptionFullName,
    DomainSubType,
    DomainType,
} from '@privateaim/core-kit';

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
    [K in `${DomainType}` | `${DomainSubType}` as DomainEventFullName<K>]: (
        data: STCEventContext<DomainEventContext<K>>
    ) => void
};

export type CTSEvents = {
    [K in DomainEventSubscriptionFullName<`${DomainType}` | `${DomainSubType}`>]: (
        target?: EventTarget,
        cb?: EventCallback
    ) => void
};
