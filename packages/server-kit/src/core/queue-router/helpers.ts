/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createNanoID, hasOwnProperty, isObject } from '@privateaim/core';
import type { QueueRouterPayload, QueueRouterPayloadInput } from './types';

export function buildQueueRouterPublishPayload(
    input: QueueRouterPayloadInput,
) : QueueRouterPayload {
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

export function isQueueRouterPayload(input: unknown) : input is QueueRouterPayload {
    return isObject(input) &&
        typeof input.id === 'string' &&
        typeof input.type === 'string' &&
        hasOwnProperty(input, 'data') &&
        isObject(input.data) &&
        hasOwnProperty(input, 'metadata') &&
        isObject(input.metadata);
}
