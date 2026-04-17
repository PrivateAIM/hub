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
    RedisClientInjectionKey,
    createAuthupClientTokenCreator,
} from '@privateaim/server-kit';
import { EntityEventHandler, LoggerTransport } from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { LogComponentWriteHandler } from './components/log/handlers/index.ts';
import { MemoryLogStore } from '../adapters/telemetry/memory.ts';
import { useEnv } from './modules/config/index.ts';
import { VictoriaLogsModule } from './modules/victoria-logs/index.ts';
import { HTTPModule } from './modules/http/index.ts';
import { ServerTelemetryApplicationBuilder } from './builder.ts';

export function createApplication() {
    const env = useEnv();

    const builder = new ServerTelemetryApplicationBuilder()
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

            handlers.push(new EntityEventHandler());

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
                save: (() => {
                    const component = new LogComponentWriteHandler(new MemoryLogStore());
                    return async (value) => {
                        try {
                            await component.handle(value);
                        } catch (e) {
                            console.error(e);
                        }
                    };
                })(),
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

    return app;
}
