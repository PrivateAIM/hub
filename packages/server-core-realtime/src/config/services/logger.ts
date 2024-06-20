/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { LoggerCreateContext } from '@privateaim/server-kit';
import { createLogger, setLoggerFactory } from '@privateaim/server-kit';

export function setupLogger(ctx: LoggerCreateContext): void {
    setLoggerFactory(() => createLogger(ctx));
}
