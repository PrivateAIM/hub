/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// QueueRouterPublishPayload
// QueueRouterPublishContext

// QueueRouterConsumePayload (metadata.routingKey, metadata.exchange, metadata.redelivered)
// QueueRouterConsumeContext

import type { QueueRouterRoutingType } from './constants';

export type QueueRouterRouting = {
    type: `${QueueRouterRoutingType}`,
    key: string,
    namespace?: string,
};

export type QueueRouterPayloadMetadata = {
    timestamp: number,
    redelivered?: boolean,
    persistent?: boolean,
    routing: QueueRouterRouting
};

export type QueueRouterPayload<
    T = string,
    D = Record<string, any>,
> = {
    id: string,
    type: T,
    data: D,
    metadata: QueueRouterPayloadMetadata
};

export type QueueRouterPayloadInput<T = string, D = Record<string, any>> = {
    id?: string,
    type: T,
    data?: D,
    metadata: Partial<Pick<QueueRouterPayloadMetadata, 'timestamp'>> &
    Omit<QueueRouterPayloadMetadata, 'timestamp'>
};

export type QueueRouterHandler<
    T = string,
    D = Record<string, any>,
> = (message: QueueRouterPayload<T, D>) => Promise<void> | void;

export type QueueRouterHandlers<
    R extends Record<string, Record<string, any>> = Record<string, Record<string, any>>,
> = {
    $any?: QueueRouterHandler
} & {
    [K in keyof R]: QueueRouterHandler<K, R[K]>
};
