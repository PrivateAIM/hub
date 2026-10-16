/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Application } from 'orkos';
import {
    LoggerConsoleTransport,
    RemoteMessageBusInjectionKey,
} from '@privateaim/server-kit';
import {
    LogComponentDispatcher,
    LoggerTransport,
    TELEMETRY_SILENT_MESSAGE_BUS_ROUTINGS,
} from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { ServerMessengerApplicationBuilder } from './builder.ts';

export function createApplication() {
    let app: Application;
    let logDispatcher: LogComponentDispatcher | undefined;

    const builder = new ServerMessengerApplicationBuilder()
        .withConfig()
        .withMessageBus({ silentRoutings: TELEMETRY_SILENT_MESSAGE_BUS_ROUTINGS })
        .withRedis()
        .withLogger({
            transports: [
                new LoggerConsoleTransport(),
                new LoggerTransport({
                    labels: {
                        [LogFlag.SERVICE]: 'hub-server-messenger',
                        [LogFlag.CHANNEL]: LogChannel.SYSTEM,
                    },
                    save: async (data) => {
                        if (!logDispatcher) {
                            // only over AMQP: no in-process consumer takes a log line here
                            const result = app?.container.tryResolve(RemoteMessageBusInjectionKey);
                            if (!result?.success) return;
                            logDispatcher = new LogComponentDispatcher({ messageBus: result.data });
                        }
                        await logDispatcher.dispatchWrite(data);
                    },
                }),
            ],
        })
        .withAuthupHook()
        .withAuthupClient()
        .withDatabase()
        .withSweeper()
        .withWakeup()
        .withHTTP();

    app = builder.build();

    return app;
}
