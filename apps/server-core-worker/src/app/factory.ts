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
    createAuthupClientTokenCreator,
} from '@privateaim/server-kit';
import {
    LogComponentCaller,
    LoggerTransport,
} from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { useEnv } from './modules/config/index.ts';
import { CoreClientModule } from './modules/core-client/index.ts';
import { StorageClientModule } from './modules/storage-client/index.ts';
import { DockerModule } from './modules/docker/index.ts';
import { ComponentsModule } from './modules/components/index.ts';
import { ServerCoreWorkerApplicationBuilder } from './builder.ts';

export function createApplication() {
    const env = useEnv();

    let app: Application;
    let logCaller: LogComponentCaller | undefined;

    const builder = new ServerCoreWorkerApplicationBuilder()
        .withConfig()
        .withMessageBus({
            driverFactory: () => {
                if (env.rabbitMqConnectionString) {
                    return new AmqpMessageBusDriver({ connectionString: env.rabbitMqConnectionString });
                }

                return new MemoryMessageBusDriver();
            },
        });

    builder.withAuthupHook({
        baseURL: env.authupURL,
        tokenCreator: createAuthupClientTokenCreator({
            baseURL: env.authupURL,
            clientId: env.clientId,
            clientSecret: env.clientSecret,
            realm: env.realm,
        }),
    });

    builder.withLogger({
        transports: [
            new LoggerConsoleTransport(),
            new LoggerTransport({
                labels: {
                    [LogFlag.SERVICE]: 'hub-server-worker',
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
    });

    builder.withHTTP();

    app = builder.build();

    app.addModule(new StorageClientModule({ baseURL: env.storageURL }));
    app.addModule(new CoreClientModule({ baseURL: env.coreURL }));
    app.addModule(new DockerModule());
    app.addModule(new ComponentsModule());

    return app;
}
