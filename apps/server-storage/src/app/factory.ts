/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Application } from 'orkos';
import {
    EntityEventRedisHandler,
    EntityEventSocketHandler,
    LoggerConsoleTransport,
    LoggerInjectionKey,
    RedisClientInjectionKey,
    RemoteMessageBusInjectionKey,
} from '@privateaim/server-kit';
import {
    EntityEventHandler,
    EventComponentDispatcher,
    LogComponentDispatcher,
    LoggerTransport,
    TELEMETRY_SILENT_MESSAGE_BUS_ROUTINGS,
} from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { StorageModule } from './modules/storage/index.ts';
import { HTTPModule } from './modules/http/index.ts';
import { ComponentsModule } from './modules/components/index.ts';
import { ServerStorageApplicationBuilder } from './builder.ts';

export function createApplication() {
    let app: Application;
    let logDispatcher: LogComponentDispatcher | undefined;

    const builder = new ServerStorageApplicationBuilder()
        .withConfig()
        .withMessageBus({ silentRoutings: TELEMETRY_SILENT_MESSAGE_BUS_ROUTINGS })
        .withRedis()
        .withAuthupHook()
        .withAuthupClient();

    builder.withEntityEvent({
        handlerFactory: (container) => {
            const handlers = [];

            const redisResult = container.tryResolve(RedisClientInjectionKey);

            if (redisResult.success) {
                handlers.push(new EntityEventRedisHandler(redisResult.data));
                handlers.push(new EntityEventSocketHandler(redisResult.data));
            }

            // only over AMQP: server-telemetry consumes entity events, nothing in-process does
            const messageBusResult = container.tryResolve(RemoteMessageBusInjectionKey);

            if (messageBusResult.success) {
                const loggerResult = container.tryResolve(LoggerInjectionKey);

                handlers.push(new EntityEventHandler({
                    eventComponentDispatcher: new EventComponentDispatcher({ messageBus: messageBusResult.data }),
                    logger: loggerResult.success ? loggerResult.data : undefined,
                }));
            }

            return handlers;
        },
    });

    builder.withLogger({
        transports: [
            new LoggerConsoleTransport(),
            new LoggerTransport({
                labels: {
                    [LogFlag.SERVICE]: 'hub-server-storage',
                    [LogFlag.CHANNEL]: LogChannel.SYSTEM,
                },
                save: async (data) => {
                    if (!logDispatcher) {
                        // only over AMQP: no in-process consumer takes a log line here
                        const result = app?.container.tryResolve(RemoteMessageBusInjectionKey);

                        if (!result?.success) {
                            return;
                        }

                        logDispatcher = new LogComponentDispatcher({ messageBus: result.data });
                    }

                    await logDispatcher.dispatchWrite(data);
                },
            }),
        ],
    });

    builder.withDatabase();

    app = builder.build();

    app.addModule(new StorageModule());
    app.addModule(new HTTPModule());
    app.addModule(new ComponentsModule());

    return app;
}
