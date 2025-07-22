/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { LogLevel } from './index';

export interface Log {
    /**
     * Time in micro seconds
     */
    time: string | bigint,

    /**
     *  message
     */
    message: string,

    /**
     * level
     */
    level: `${LogLevel}`,

    /**
     * additional labels
     */
    labels: Record<string, string>
}
