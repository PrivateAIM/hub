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
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';

export function setupLogging(): void {
    setLoggerFactory(() => {
        const transport = new LoggerTransport({
            labels: {
                [LogFlag.SERVICE]: 'hub-server-core',
                [LogFlag.CHANNEL]: LogChannel.SYSTEM,
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
            transports: [transport],
        });
    });
}
