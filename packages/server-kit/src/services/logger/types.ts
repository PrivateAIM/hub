/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger, LoggerOptions } from 'winston';

export type LoggerTransports = LoggerOptions['transports'];

export type LoggerCreateContext = {
    options?: Partial<LoggerOptions>,
    transports?: LoggerTransports
};

export type {
    Logger,
};
