/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { read } from 'envix';
import { createLogger as create, format, transports } from 'winston';
import type { Logger, LoggerCreateContext, LoggerTransports } from './types';
import { EnvironmentName } from '../../constants';

function toTransports(input: LoggerTransports) {
    return Array.isArray(input) ? input : [input];
}

export function createLogger(ctx: LoggerCreateContext = {}) : Logger {
    let loggerTransports : LoggerTransports;
    if (read('env') === EnvironmentName.PRODUCTION) {
        loggerTransports = [
            new transports.Console({
                level: 'info',
            }),
            ...(ctx.transports ? toTransports(ctx.transports) : []),
        ];
    } else {
        loggerTransports = [
            new transports.Console({
                level: 'debug',
            }),
            ...(ctx.transports ? toTransports(ctx.transports) : []),
        ];
    }

    return create({
        format: format.combine(
            format.errors({ stack: true }),
            format.timestamp(),
            format.simple(),
        ),
        level: 'debug',
        transports: loggerTransports,
        // todo: deeply merge options
        ...(ctx.options || {}),
    });
}
