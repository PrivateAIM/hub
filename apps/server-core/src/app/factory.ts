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
import {
    EntityEventHandler,
    LoggerTransport,
    isLogComponentCallerUsable,
    useLogComponentCaller,
} from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { useEnv } from './modules/config/index.ts';
import { ServerCoreApplicationBuilder } from './builder.ts';
import { AggregatorsModule } from './modules/aggregators/index.ts';
import { AnalysisModule } from './modules/analysis/index.ts';
import { ComponentsModule } from './modules/components/index.ts';
import { HarborModule } from './modules/harbor/index.ts';
import { SwaggerModule } from './modules/swagger/index.ts';
import { AuthupModule } from './modules/authup/index.ts';
import { TelemetryClientModule } from './modules/telemetry-client/index.ts';

export function createApplication() {
    const env = useEnv();

    const builder = new ServerCoreApplicationBuilder()
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
                    [LogFlag.SERVICE]: 'hub-server-core',
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
    });

    builder.withDatabase();
    builder.withHTTP(undefined, { socket: true });

    const app = builder.build();

    if (env.telemetryURL) {
        app.addModule(new TelemetryClientModule({ baseURL: env.telemetryURL }));
    }

    app.addModule(new SwaggerModule());
    app.addModule(new HarborModule());
    app.addModule(new ComponentsModule());
    app.addModule(new AnalysisModule());
    app.addModule(new AggregatorsModule());
    app.addModule(new AuthupModule());

    return app;
}
