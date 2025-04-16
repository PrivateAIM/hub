/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    DomainEntityID,
    DomainEventSubscriptionFullName,
} from '@privateaim/core-kit';
import type {
    STCEventRecord,
} from '@privateaim/core-realtime-kit';
import type { MaybeRef } from 'vue';

export type EntitySocketContext<
    A extends string,
    T extends Record<string, any>,
> = {
    type: A,
    realmId?: MaybeRef<string | undefined>,
    target?: boolean,
    targetId?: MaybeRef<DomainEntityID<T> | undefined>,
    lockId?: MaybeRef<DomainEntityID<T> | undefined>,
    onCreated?(entity: T): any,
    onUpdated?(entity: Partial<T>): any,
    onDeleted?(entity: T): any,
    processEvent?(event: STCEventRecord<A, T>, realmId?: string) : boolean;
    buildChannelName?(entityId?: DomainEntityID<T>) : string;
    buildSubscribeEventName?(): DomainEventSubscriptionFullName<any>;
    buildUnsubscribeEventName?(): DomainEventSubscriptionFullName<any>;
};

export type EntitySocket = {
    subscribe() : void;
    unsubscribe() : void;
};
