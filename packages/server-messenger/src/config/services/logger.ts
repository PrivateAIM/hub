/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { LoggerConsoleTransport, createLogger, setLoggerFactory } from '@privateaim/server-kit';
import { LoggerTransport, isLogComponentCallerUsable, useLogComponentCaller } from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';

export function setupLogger(): void {
    setLoggerFactory(() => createLogger({
        transports: [
            new LoggerConsoleTransport(),
            new LoggerTransport({
                labels: {
                    [LogFlag.SERVICE]: 'hub-server-messenger',
                    [LogFlag.CHANNEL]: LogChannel.SYSTEM,
                },
                save: async (data) => {
                    if (isLogComponentCallerUsable()) {
                        const logComponent = useLogComponentCaller();
                        await logComponent.callWrite(data);
                    }
                },
            }),
        ],
    }));
}
