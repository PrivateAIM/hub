/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    LoggerConsoleTransport,
} from '@privateaim/server-kit';
import {
    LoggerTransport,
    isLogComponentCallerUsable,
    useLogComponentCaller,
} from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { useEnv } from './modules/config/index.ts';
import { ServerMessengerApplicationBuilder } from './builder.ts';

export function createApplication() {
    const env = useEnv();

    return new ServerMessengerApplicationBuilder()
        .withConfig()
        .withAmqp({ connectionString: env.rabbitMqConnectionString })
        .withRedis({ connectionString: env.redisConnectionString })
        .withLogger({
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
        })
        .withHTTP()
        .build();
}
