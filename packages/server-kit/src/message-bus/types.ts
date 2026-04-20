/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MessageBusRoutingType } from './constants';

export type MessageBusRouting = {
    type: `${MessageBusRoutingType}`,
    key: string,
    namespace?: string,
};

export type MessageBusPayloadMetadata = {
    timestamp: number,
    redelivered?: boolean,
    persistent?: boolean,
    routing: MessageBusRouting
};

export type MessageBusPublishOptions = {
    logging?: boolean
};

export type MessageBusPayload<
    T = string,
    D = Record<string, any>,
> = {
    id: string,
    type: T,
    data: D,
    metadata: MessageBusPayloadMetadata
};

export type MessageBusPayloadMetadataInput = Partial<Pick<MessageBusPayloadMetadata, 'timestamp'>> &
Omit<MessageBusPayloadMetadata, 'timestamp'>;

export type MessageBusPayloadInput<
    KEY = string,
    VALUE = Record<string, any>,
> = {
    id?: string,
    type: KEY,
    data?: VALUE,
    metadata: MessageBusPayloadMetadataInput
};

export type MessageBusHandler<
    KEY = string,
    D = Record<string, any>,
> = (message: MessageBusPayload<KEY, D>) => Promise<void> | void;

export type MessageBusHandlers<
    R extends Record<string, Record<string, any>> = Record<string, Record<string, any>>,
> = {
    $any?: MessageBusHandler
} & {
    [K in keyof R]: MessageBusHandler<K, R[K]>
};
