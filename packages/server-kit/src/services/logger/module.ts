/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { read } from 'envix';
import path from 'node:path';
import { EnvironmentName } from 'typeorm-extension';
import type { Logger } from 'winston';
import { createLogger as create, format, transports } from 'winston';
import type { LoggerCreateContext, LoggerTransports } from './types';

export function createLogger(ctx: LoggerCreateContext = {}) : Logger {
    const { directory, options = {} } = ctx;

    let loggerTransports : LoggerTransports;
    if (read('env') === EnvironmentName.PRODUCTION) {
        loggerTransports = [
            new transports.Console({
                level: 'info',
            }),
            new transports.File({
                filename: path.join(directory || process.cwd(), 'access.log'),
                level: 'http',
                maxsize: 10 * 1024 * 1024, // 10MB
                maxFiles: 5,
            }),
            new transports.File({
                filename: path.join(directory || process.cwd(), 'error.log'),
                level: 'warn',
                maxsize: 10 * 1024 * 1024, // 10MB
                maxFiles: 5,
            }),
        ];
    } else {
        loggerTransports = [
            new transports.Console({
                level: 'debug',
            }),
        ];
    }

    return create({
        format: format.combine(
            format.errors({ stack: true }),
            format.timestamp(),
            format.colorize(),
            format.simple(),
        ),
        level: 'debug',
        transports: loggerTransports,
        // todo: deeply merge options
        ...(options || {}),
    });
}
