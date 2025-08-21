/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { LoggerCreateContext } from '@privateaim/server-kit';
import { createLogger, setLoggerFactory } from '@privateaim/server-kit';
import { LoggerTransport, isLogComponentServiceUsable, useLogComponentService } from '@privateaim/server-telemetry-kit';
import { useEnv } from '../env';

export function setupLogger(ctx: LoggerCreateContext): void {
    setLoggerFactory(() => {
        const transport = new LoggerTransport({
            labels: {
                service: 'hub-server-messenger',
                namespace: useEnv('env'),
                type: 'system',
            },
            save: async (data) => {
                if (isLogComponentServiceUsable()) {
                    const logComponent = useLogComponentService();
                    await logComponent.command({
                        command: 'write',
                        data,
                    });
                }
            },
        });

        return createLogger({
            ...ctx,
            transports: [transport],
        });
    });
}
