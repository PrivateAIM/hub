/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createNanoID, hasOwnProperty, isObject } from '@privateaim/kit';
import type { MessageBusPayload, MessageBusPayloadInput } from './types';

export function buildMessageBusPublishPayload(
    input: MessageBusPayloadInput,
) : MessageBusPayload {
    return {
        id: input.id || createNanoID(),
        type: input.type,
        data: input.data || {},
        metadata: {
            timestamp: Date.now(),
            ...input.metadata,
        },
    };
}

export function isMessageBusPayload(input: unknown) : input is MessageBusPayload {
    return isObject(input) &&
        typeof input.id === 'string' &&
        typeof input.type === 'string' &&
        hasOwnProperty(input, 'data') &&
        isObject(input.data) &&
        hasOwnProperty(input, 'metadata') &&
        isObject(input.metadata);
}
