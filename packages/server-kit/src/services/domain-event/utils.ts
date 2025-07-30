/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '@privateaim/kit';
import type { DomainEventChannelName } from './types';

export function transformEventData<T>(input: T) : T {
    if (isObject(input)) {
        const keys = Object.keys(input);
        for (let i = 0; i < keys.length; i++) {
            const value = input[keys[i]];
            if (value instanceof Date) {
                input[keys[i]] = value.toISOString();
            }
        }
    }

    return input;
}

export function buildEventChannelName(
    input: DomainEventChannelName,
    id?: string,
) : string {
    if (typeof input === 'string') {
        return input;
    }

    return input(id);
}
