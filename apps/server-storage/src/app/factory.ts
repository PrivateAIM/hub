/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BaseApplicationBuilder,
    EntityEventRedisHandler,
    EntityEventSocketHandler,
    LoggerConsoleTransport,
    RedisClientInjectionKey,
    createAuthupClientTokenCreator,
} from '@privateaim/server-kit';
import {
    EntityEventHandler,
    LoggerTransport,
    isLogComponentCallerUsable,
    useLogComponentCaller,
} from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { useEnv } from '../config/env/index.ts';
import { DatabaseModule } from './modules/database/index.ts';
import { MinioModule } from './modules/minio/index.ts';

export function createApplication() {
    const env = useEnv();

    const builder = new BaseApplicationBuilder()
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
        builder.withAuthup({ baseURL: env.authupURL });
    }

    builder.withEntityEvent({
        handlerFactory: (container) => {
            const handlers = [];

            const redisResult = container.tryResolve(RedisClientInjectionKey);
            if (redisResult.success) {
                handlers.push(new EntityEventRedisHandler(redisResult.data));
                handlers.push(new EntityEventSocketHandler(redisResult.data));
            }

            handlers.push(new EntityEventHandler());

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
                    if (isLogComponentCallerUsable()) {
                        const component = useLogComponentCaller();
                        await component.callWrite(data);
                    }
                },
            }),
        ],
    });

    const app = builder.build();

    app.addModule(new MinioModule({ connectionString: env.minioConnectionString }));

    app.addModule(new DatabaseModule());

    return app;
}
