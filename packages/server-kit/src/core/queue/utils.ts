/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty, isObject } from '@privateaim/kit';
import type { QueuePayload } from './type';

export function isQueuePayload(input: unknown) : input is QueuePayload {
    return isObject(input) &&
        hasOwnProperty(input, 'data') &&
        isObject(input.data) &&
        hasOwnProperty(input, 'metadata') &&
        isObject(input.metadata);
}
