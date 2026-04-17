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
    QueueRouterInjectionKey,
    RedisClientInjectionKey,
    createAuthupClientTokenCreator,
} from '@privateaim/server-kit';
import {
    EntityEventHandler,
    EventComponentCaller,
    LogComponentCaller,
    LoggerTransport,
} from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { useEnv } from './modules/config/index.ts';
import { MinioModule } from './modules/minio/index.ts';
import { HTTPModule } from './modules/http/index.ts';
import { SwaggerModule } from './modules/swagger/index.ts';
import { ComponentsModule } from './modules/components/index.ts';
import { ServerStorageApplicationBuilder } from './builder.ts';

export function createApplication() {
    const env = useEnv();

    let app: Application;
    let logCaller: LogComponentCaller | undefined;

    const builder = new ServerStorageApplicationBuilder()
        .withConfig()
        .withAmqp({ connectionString: env.rabbitMqConnectionString })
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

            const qrResult = container.tryResolve(QueueRouterInjectionKey);
            const queueRouter = qrResult.success ? qrResult.data : undefined;
            const eventCaller = queueRouter ? new EventComponentCaller({ queueRouter }) : undefined;

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
                    [LogFlag.SERVICE]: 'hub-server-storage',
                    [LogFlag.CHANNEL]: LogChannel.SYSTEM,
                },
                save: async (data) => {
                    if (!logCaller) {
                        const result = app?.container.tryResolve(QueueRouterInjectionKey);
                        if (!result?.success) return;
                        logCaller = new LogComponentCaller({ queueRouter: result.data });
                    }
                    await logCaller.callWrite(data);
                },
            }),
        ],
    });

    builder.withDatabase();

    app = builder.build();

    // Minio must be added before HTTP, because
    // HTTP controllers need the MinIO client from the container.
    app.addModule(new MinioModule({ connectionString: env.minioConnectionString }));

    app.addModule(new HTTPModule());
    app.addModule(new SwaggerModule());
    app.addModule(new ComponentsModule());

    return app;
}
