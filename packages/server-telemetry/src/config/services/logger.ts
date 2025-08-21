/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createLogger, setLoggerFactory } from '@privateaim/server-kit';
import { LoggerTransport } from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { LogComponentWriteHandler } from '../../components/log/handlers';

export function setupLogging(): void {
    setLoggerFactory(() => {
        const component = new LogComponentWriteHandler();

        const transport = new LoggerTransport({
            labels: {
                [LogFlag.SERVICE]: 'hub-server-telemetry',
                [LogFlag.CHANNEL]: LogChannel.SYSTEM,
            },
            save: async (value) => {
                await component.handle(value);
            },
        });

        return createLogger({
            transports: [transport],
        });
    });
}
