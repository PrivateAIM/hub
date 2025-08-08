/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { omitRecord, pickRecord } from '@authup/kit';
import type { Log } from './entity';

export function omitLogProperties<T extends Log>(input: T) : Omit<T, keyof Log> {
    return omitRecord(input, [
        'message',
        'time',
        'labels',
        'level',
    ]);
}

export function pickLogProperties<T extends Log>(input: T) : Log {
    return pickRecord(input, [
        'message',
        'time',
        'labels',
        'level',
    ]);
}
