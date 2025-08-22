/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { nanoSeconds } from '@privateaim/kit';
import type { Log, LogInput } from './entity';

export function normalizeLogInput(input: LogInput) : Log {
    return {
        ...input,
        time: input.time || nanoSeconds(),
        labels: input.labels || {},
    };
}
