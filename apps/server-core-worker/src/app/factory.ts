/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BaseApplicationBuilder,
    LoggerConsoleTransport,
    createAuthupClientTokenCreator,
} from '@privateaim/server-kit';
import {
    LoggerTransport,
    isLogComponentCallerUsable,
    useLogComponentCaller,
} from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { useEnv } from '../config/env/index.ts';
import { CoreClientModule } from './modules/core-client/index.ts';
import { StorageClientModule } from './modules/storage-client/index.ts';

export function createApplication() {
    const env = useEnv();

    const builder = new BaseApplicationBuilder()
        .withAmqp({ connectionString: env.rabbitMqConnectionString });

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
                    if (isLogComponentCallerUsable()) {
                        const logComponent = useLogComponentCaller();
                        await logComponent.callWrite(data);
                    }
                },
            }),
        ],
    });

    const app = builder.build();

    app.addModule(new StorageClientModule({ baseURL: env.storageURL }));
    app.addModule(new CoreClientModule({ baseURL: env.coreURL }));

    return app;
}
