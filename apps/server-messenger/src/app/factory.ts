/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Application } from 'orkos';
import {
    AmqpMessageBusDriver,
    LoggerConsoleTransport,
    MemoryMessageBusDriver,
    MessageBusInjectionKey,
} from '@privateaim/server-kit';
import {
    LogComponentCaller,
    LoggerTransport,
} from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { useEnv } from './modules/config/index.ts';
import { ServerMessengerApplicationBuilder } from './builder.ts';

export function createApplication() {
    const env = useEnv();

    let app: Application;
    let logCaller: LogComponentCaller | undefined;

    const builder = new ServerMessengerApplicationBuilder()
        .withConfig()
        .withMessageBus({
            driverFactory: () => {
                if (env.rabbitMqConnectionString) {
                    return new AmqpMessageBusDriver({ connectionString: env.rabbitMqConnectionString });
                }

                return new MemoryMessageBusDriver();
            },
        })
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
                        if (!logCaller) {
                            const result = app?.container.tryResolve(MessageBusInjectionKey);
                            if (!result?.success) return;
                            logCaller = new LogComponentCaller({ messageBus: result.data });
                        }
                        await logCaller.callWrite(data);
                    },
                }),
            ],
        })
        .withHTTP();

    app = builder.build();

    return app;
}
