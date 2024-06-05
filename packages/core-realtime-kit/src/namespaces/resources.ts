/*
 * Copyright (c) 2021-2024.
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
} from '@privateaim/core';
import type {
    CTSEvents, EventCallback, EventTarget, STCEventContext, STCEvents,
} from '../types';

export type SocketResourcesNamespaceSTCEvents = STCEvents & {
    [K in `${DomainType}` | `${DomainSubType}` as DomainEventFullName<K>]: (
        data: STCEventContext<DomainEventContext<K>>
    ) => void
};

// ------------------------------------------------------------------------------------

export type SocketResourcesNamespaceCTSEvents = CTSEvents & {
    [K in DomainEventSubscriptionFullName<`${DomainType}` | `${DomainSubType}`>]: (
        target?: EventTarget,
        cb?: EventCallback
    ) => void
};

// -----------------------------------
