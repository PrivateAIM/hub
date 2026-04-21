/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    EntityEventRedisHandler,
    EntityEventSocketHandler,
    LoggerConsoleTransport,
    LoggerInjectionKey,
    MessageBusInjectionKey,
    RedisClientInjectionKey,
} from '@privateaim/server-kit';
import { EntityEventHandler, EventComponentCaller, LoggerTransport } from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { LogComponentWriteHandler } from './components/log/handlers/index.ts';
import { VictoriaLogsModule } from './modules/victoria-logs/index.ts';
import { HTTPModule } from './modules/http/index.ts';
import { SwaggerModule } from './modules/swagger/index.ts';
import { ComponentsModule } from './modules/components/index.ts';
import { ServerTelemetryApplicationBuilder } from './builder.ts';

export function createApplication() {
    const builder = new ServerTelemetryApplicationBuilder()
        .withConfig()
        .withMessageBus()
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

    app.addModule(new VictoriaLogsModule());
    app.addModule(new HTTPModule());
    app.addModule(new SwaggerModule());
    app.addModule(new ComponentsModule());

    return app;
}
