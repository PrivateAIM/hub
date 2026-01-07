/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Log, LogInput } from './entity';

export function normalizeLogInput(input: LogInput) : Log {
    return {
        ...input,
        time: input.time || new Date().toISOString(),
        labels: input.labels || {},
    };
}
