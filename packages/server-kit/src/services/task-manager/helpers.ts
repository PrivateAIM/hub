/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '@privateaim/kit';
import type { TaskEntry } from './types';

export function isTaskEntry(input: unknown) : input is TaskEntry {
    return isObject(input) &&
        typeof (input as TaskEntry).type === 'string' &&
        isObject((input as TaskEntry).data);
}
