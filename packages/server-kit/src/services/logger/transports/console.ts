/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { read } from 'envix';
import { transports } from 'winston';
import type { TransportStreamOptions } from 'winston-transport';
import { EnvironmentName } from '../../../constants';
import type { LoggerTransport } from '../types';

export class LoggerConsoleTransport extends transports.Console {
    constructor(options: TransportStreamOptions = {}) {
        super({
            level: read('env') === EnvironmentName.PRODUCTION ?
                'info' :
                'debug',
            ...options,
        });
    }
}

export function createLoggerConsoleTransport(options: TransportStreamOptions = {}) : LoggerTransport {
    return new LoggerConsoleTransport(options);
}
