/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { LoggerCreateContext } from '@privateaim/server-kit';
import { createLogger, setLoggerFactory, useLogStore } from '@privateaim/server-kit';
import { useEnv } from '../env';

export function setupLogger(ctx: LoggerCreateContext): void {
    const store = useLogStore();
    store.setLabels({
        service: 'hub-server-messenger',
        namespace: useEnv('env'),
        type: 'system',
    });

    setLoggerFactory(() => createLogger(ctx));
}
