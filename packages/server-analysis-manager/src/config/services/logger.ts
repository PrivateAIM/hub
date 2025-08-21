/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    createLogger,
    setLoggerFactory,
} from '@privateaim/server-kit';
import { LoggerTransport, isLogComponentServiceUsable, useLogComponentService } from '@privateaim/server-telemetry-kit';
import { WRITABLE_DIRECTORY_PATH } from '../../constants';
import { useEnv } from '../env';

export function setupLogger(): void {
    setLoggerFactory(() => {
        const transport = new LoggerTransport({
            labels: {
                service: 'hub-server-worker',
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
            directory: WRITABLE_DIRECTORY_PATH,
            transports: [transport],
        });
    });
}
