/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { LoggerCreateContext } from '@privateaim/server-kit';
import { createLogger, setLoggerFactory } from '@privateaim/server-kit';
import { useEnv } from '../env';

export function setupLogging(ctx: LoggerCreateContext): void {
    setLoggerFactory(() => createLogger({
        ...ctx,
        labels: {
            service: 'hub-server-storage',
            namespace: useEnv('env'),
            type: 'system',
        },
    }));
}
