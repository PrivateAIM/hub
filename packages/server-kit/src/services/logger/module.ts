/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createLogger as create, format } from 'winston';
import { createLoggerConsoleTransport } from './transports';
import type {
    Logger, LoggerCreateContext, LoggerTransport,
} from './types';

export function createLogger(ctx: LoggerCreateContext = {}) : Logger {
    const transports : LoggerTransport[] = [
        ...(ctx.transports || []),
    ];

    if (transports.length === 0) {
        transports.push(createLoggerConsoleTransport());
    }

    return create({
        format: format.combine(
            format.errors({ stack: true }),
            format.timestamp(),
            format.simple(),
        ),
        level: 'debug',
        transports,
        // todo: deeply merge options
        ...(ctx.options || {}),
    });
}
