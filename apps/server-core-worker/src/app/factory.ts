/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Application } from 'orkos';
import {
    LoggerConsoleTransport,
    MessageBusInjectionKey,
} from '@privateaim/server-kit';
import {
    LogComponentCaller,
    LoggerTransport,
} from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { CoreClientModule } from './modules/core-client/index.ts';
import { StorageClientModule } from './modules/storage-client/index.ts';
import { DockerModule } from './modules/docker/index.ts';
import { ComponentsModule } from './modules/components/index.ts';
import { ServerCoreWorkerApplicationBuilder } from './builder.ts';

export function createApplication() {
    let app: Application;
    let logCaller: LogComponentCaller | undefined;

    const builder = new ServerCoreWorkerApplicationBuilder()
        .withConfig()
        .withMessageBus()
        .withAuthupHook();

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

    app.addModule(new StorageClientModule());
    app.addModule(new CoreClientModule());
    app.addModule(new DockerModule());
    app.addModule(new ComponentsModule());

    return app;
}
