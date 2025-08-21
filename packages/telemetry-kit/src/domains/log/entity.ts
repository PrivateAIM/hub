/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { LogChannel, LogLevel } from './constants';

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
     * service
     */
    service: string,

    /**
     * channel
     */
    channel: `${LogChannel}`,

    /**
     * additional labels
     */
    labels: Record<string, string>
}

type RequiredTypes = ('message' | 'level' | 'service' | 'channel');

export type LogInput = Pick<Log, RequiredTypes & keyof Log> & Partial<Omit<Log, RequiredTypes & keyof Log>>;
