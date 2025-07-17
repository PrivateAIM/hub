/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger, LoggerOptions } from 'winston';
import type { LogStore } from '../log-store';

export type LoggerCreateContext = {
    directory?: string,
    options?: Partial<LoggerOptions>,
    store?: LogStore,
    labels?: Record<string, string>,
};

export type LoggerTransports = LoggerOptions['transports'];

export type {
    Logger,
};
