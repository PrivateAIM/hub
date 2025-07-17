/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { LoggerCreateContext } from '@privateaim/server-kit';
import {
    LokiLogStore,
    MemoryLogStore,
    createLogger, isLokiClientUsable, setLogStoreFactory, setLoggerFactory, useLokiClient,
} from '@privateaim/server-kit';
import { useEnv } from '../env';

export function setupLogging(ctx: LoggerCreateContext): void {
    const labels : Record<string, string> = {
        service: 'hub-server-core',
        namespace: useEnv('env'),
        type: 'system',
    };

    setLogStoreFactory(() => {
        if (isLokiClientUsable()) {
            const loki = useLokiClient();
            return new LokiLogStore(loki, labels);
        }

        return new MemoryLogStore(labels);
    });

    setLoggerFactory(() => createLogger(ctx));
}
