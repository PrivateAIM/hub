/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    DomainEntity,
    DomainEntityID,
    DomainEventContext,
    DomainEventSubscriptionFullName,
    DomainType,
    SocketSTCEventContext,
} from '@privateaim/core';
import type { MaybeRef } from 'vue';

export type EntitySocketContext<
    A extends `${DomainType}`,
    T = DomainEntity<A>,
> = {
    type: A,
    realmId?: MaybeRef<string | undefined>,
    target?: boolean,
    targetId?: MaybeRef<DomainEntityID<T> | undefined>,
    lockId?: MaybeRef<DomainEntityID<T> | undefined>,
    onCreated?(entity: T): any,
    onUpdated?(entity: Partial<T>): any,
    onDeleted?(entity: T): any,
    processEvent?(event: SocketSTCEventContext<DomainEventContext<A>>, realmId?: string) : boolean;
    buildChannelName?(entityId?: DomainEntityID<T>) : string;
    buildSubscribeEventName?(): DomainEventSubscriptionFullName;
    buildUnsubscribeEventName?(): DomainEventSubscriptionFullName;
};

export type EntitySocket = {
    mount() : void;
    unmount() : void;
};
