/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { LoggerOptions } from 'winston';

export type LoggerTransports = LoggerOptions['transports'];

export type LoggerCreateContext = {
    options?: Partial<LoggerOptions>,
    transports?: LoggerTransports
};

type LogEntry = {
    /**
     * Log message.
     */
    message: string,
    [key: string]: any
};

export interface LoggerLevelFn<OUT = any> {
    (message: string, ...meta: Omit<LogEntry, 'message'>[]): OUT,
    (message: LogEntry): OUT,
    (message:string): OUT,
}

export type Logger = {
    emerg: LoggerLevelFn<Logger>,
    alert: LoggerLevelFn<Logger>,
    crit: LoggerLevelFn<Logger>,
    error: LoggerLevelFn<Logger>,
    warn: LoggerLevelFn<Logger>,
    notice: LoggerLevelFn<Logger>,
    info: LoggerLevelFn<Logger>,
    debug: LoggerLevelFn<Logger>,
};
