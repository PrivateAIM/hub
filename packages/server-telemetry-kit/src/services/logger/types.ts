/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TransportStreamOptions } from 'winston-transport';
import type { LogInput } from '@privateaim/telemetry-kit';

export type LoggerTransportSaveFn = (value: LogInput) => Promise<void> | void;
export type LoggerTransportOptions = TransportStreamOptions & {
    labels?: Record<string, string>,
    save: LoggerTransportSaveFn
};
