/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AmqpMessageBusDriver,
    EntityEventRedisHandler,
    EntityEventSocketHandler,
    LoggerConsoleTransport,
    LoggerInjectionKey,
    MemoryMessageBusDriver,
    MessageBusInjectionKey,
    RedisClientInjectionKey,
    createAuthupClientTokenCreator,
} from '@privateaim/server-kit';
import { EntityEventHandler, EventComponentCaller, LoggerTransport } from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { LogComponentWriteHandler } from './components/log/handlers/index.ts';
import { useEnv } from './modules/config/index.ts';
import { VictoriaLogsModule } from './modules/victoria-logs/index.ts';
import { HTTPModule } from './modules/http/index.ts';
import { SwaggerModule } from './modules/swagger/index.ts';
import { ComponentsModule } from './modules/components/index.ts';
import { ServerTelemetryApplicationBuilder } from './builder.ts';

export function createApplication() {
    const env = useEnv();

    const builder = new ServerTelemetryApplicationBuilder()
        .withConfig()
        .withMessageBus({
            driverFactory: () => {
                if (env.rabbitMqConnectionString) {
                    return new AmqpMessageBusDriver({ connectionString: env.rabbitMqConnectionString });
                }

                return new MemoryMessageBusDriver();
            },
        })
        .withRedis({ connectionString: env.redisConnectionString });

    if (env.authupURL) {
        builder.withAuthupHook({
            baseURL: env.authupURL,
            tokenCreator: createAuthupClientTokenCreator({
                baseURL: env.authupURL,
                clientId: env.clientId,
                clientSecret: env.clientSecret,
                realm: env.realm,
            }),
        });
        builder.withAuthupClient({ baseURL: env.authupURL });
    }

    builder.withEntityEvent({
        handlerFactory: (container) => {
            const handlers = [];

            const redisResult = container.tryResolve(RedisClientInjectionKey);
            if (redisResult.success) {
                handlers.push(new EntityEventRedisHandler(redisResult.data));
                handlers.push(new EntityEventSocketHandler(redisResult.data));
            }

            const mbResult = container.tryResolve(MessageBusInjectionKey);
            const messageBus = mbResult.success ? mbResult.data : undefined;
            const eventCaller = messageBus ? new EventComponentCaller({ messageBus }) : undefined;

            const loggerResult = container.tryResolve(LoggerInjectionKey);
            handlers.push(new EntityEventHandler({
                eventComponentCaller: eventCaller,
                logger: loggerResult.success ? loggerResult.data : undefined,
            }));

            return handlers;
        },
    });

    builder.withLogger({
        transports: [
            new LoggerConsoleTransport(),
            new LoggerTransport({
                labels: {
                    [LogFlag.SERVICE]: 'hub-server-telemetry',
                    [LogFlag.CHANNEL]: LogChannel.SYSTEM,
                },
                save: async (value) => {
                    try {
                        const component = new LogComponentWriteHandler();
                        await component.handle(value);
                    } catch (e) {
                        console.error(e);
                    }
                },
            }),
        ],
    });

    builder.withDatabase();

    const app = builder.build();

    // VictoriaLogs must be added before HTTP, because
    // HTTP controllers need the LogStore from the container.
    app.addModule(new VictoriaLogsModule({
        baseURL: env.victoriaLogsURL,
        ingestorURL: env.victoriaLogsIngestorURL,
        querierURL: env.victoriaLogsQuerierURL,
    }));

    app.addModule(new HTTPModule());
    app.addModule(new SwaggerModule());
    app.addModule(new ComponentsModule());

    return app;
}
