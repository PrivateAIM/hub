/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { LoggerConsoleTransport, createLogger, setLoggerFactory } from '@privateaim/server-kit';
import { LoggerTransport } from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { LogComponentWriteHandler } from '../../components/log/handlers/index.ts';

export function setupLogging(): void {
    setLoggerFactory(() => {
        const component = new LogComponentWriteHandler();

        return createLogger({
            transports: [
                new LoggerConsoleTransport(),
                new LoggerTransport({
                    labels: {
                        [LogFlag.SERVICE]: 'hub-server-telemetry',
                        [LogFlag.CHANNEL]: LogChannel.SYSTEM,
                    },
                    save: async (value) => {
                        try {
                            await component.handle(value);
                        } catch (e) {
                            console.log(e);
                        }
                    },
                }),
            ],
        });
    });
}
