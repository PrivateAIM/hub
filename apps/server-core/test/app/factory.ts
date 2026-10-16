/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AuthupClientModule,
    AuthupHookModule,
    LoggerModule,
    MessageBusModule,
} from '@privateaim/server-kit';
import type { IModule } from 'orkos';
import { MemoryMessageBusDriver } from 'hubwire';
import { createFakeClient } from '@privateaim/telemetry-kit/testing';
import type { FakeHandlerMap } from '@privateaim/telemetry-kit/testing';
import { ConfigModule } from '../../src/app/modules/config/index.ts';
import { AnalysisModule } from '../../src/app/modules/analysis/index.ts';
import { HTTPModule } from '../../src/app/modules/http/index.ts';
import { TelemetryClientInjectionKey } from '../../src/app/modules/telemetry-client/index.ts';

import { TestApplication } from './module.ts';
import { TestHTTPApplication } from './http.ts';
import { createTestDatabaseModule } from './database.ts';

/**
 * Registers a transport-level fake under `TelemetryClientInjectionKey`, so the
 * telemetry-coupled controllers (`AnalysisLogController`,
 * `AnalysisNodeLogController`) can be exercised without a real telemetry
 * service. `HTTPModule` picks it up via `tryResolve`, and the real
 * `TelemetryClientModule` is not in the test module list at all — so there is
 * nothing to clobber and no guard needed.
 *
 * Ordering is guaranteed by the module NAME, not by the position in the array:
 * `HTTPModule` declares `{ name: 'telemetryClient', optional: true }`, so orkos
 * topologically sorts this module ahead of it.
 */
function createTestTelemetryClientModule(handlers: FakeHandlerMap): IModule {
    return {
        name: 'telemetryClient',
        dependencies: ['config'],

        async setup(container): Promise<void> {
            container.register(TelemetryClientInjectionKey, { useValue: createFakeClient({ handlers }) });
        },
    };
}

export type TestApplicationOptions = {
    /**
     * Opt in to a faked telemetry client. Omitted, the token stays UNBOUND —
     * which is what the log controllers see in production when `telemetryURL`
     * is unset.
     */
    telemetryHandlers?: FakeHandlerMap
};

export function createTestApplication(options: TestApplicationOptions = {}): TestHTTPApplication {
    process.env.PORT = '0';

    const modules: IModule[] = [
        new ConfigModule(),
        new LoggerModule(),
        // in-process: commands are dispatched, nothing in the suite consumes them
        new MessageBusModule({ driverFactory: () => new MemoryMessageBusDriver() }),
        new AuthupHookModule(),
        new AuthupClientModule(),
        createTestDatabaseModule(),
        new AnalysisModule(),
    ];

    if (options.telemetryHandlers) {
        modules.push(createTestTelemetryClientModule(options.telemetryHandlers));
    }

    modules.push(new HTTPModule());

    return new TestHTTPApplication({ modules });
}

export function createTestDatabaseApplication(): TestApplication {
    const modules: IModule[] = [
        new ConfigModule(),
        new LoggerModule(),
        // in-process: commands are dispatched, nothing in the suite consumes them
        new MessageBusModule({ driverFactory: () => new MemoryMessageBusDriver() }),
        createTestDatabaseModule(),
        new AnalysisModule(),
    ];

    return new TestApplication({ modules });
}
