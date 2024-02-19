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
} from '../../domains';
import type { SocketCTSEvents, SocketSTCEventContext, SocketSTCEvents } from '../types';

export type SocketResourcesNamespaceSTCEvents = SocketSTCEvents & {
    [K in `${DomainType}` | `${DomainSubType}` as DomainEventFullName<K>]: (
        data: SocketSTCEventContext<DomainEventContext<K>>
    ) => void
};
// ------------------------------------------------------------------------------------

export type SocketResourcesNamespaceCTSEventTarget = string | number | undefined;
export type SocketResourcesNamespaceCTSEventCallback = (error?: Error | null) => void;

export type SocketResourcesNamespaceCTSEvents = SocketCTSEvents & {
    [K in DomainEventSubscriptionFullName<`${DomainType}` | `${DomainSubType}`>]: (
        target?: SocketResourcesNamespaceCTSEventTarget,
        cb?: SocketResourcesNamespaceCTSEventCallback
    ) => void
};

// -----------------------------------
