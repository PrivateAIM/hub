/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { LoggerCreateContext } from '@privateaim/server-kit';
import { createLogger, setLoggerFactory } from '@privateaim/server-kit';
import { LoggerTransport } from '@privateaim/server-telemetry-kit';
import { LogComponentWriteHandler } from '../../components/log/handlers';
import { useEnv } from '../env';

export function setupLogging(ctx: LoggerCreateContext): void {
    setLoggerFactory(() => {
        const component = new LogComponentWriteHandler();

        const transport = new LoggerTransport({
            labels: {
                service: 'hub-server-telemetry',
                namespace: useEnv('env'),
                type: 'system',
            },
            save: async (value) => {
                await component.handle(value);
            },
        });

        return createLogger({
            ...ctx,
            transports: [transport],
        });
    });
}
