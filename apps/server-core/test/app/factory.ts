/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AuthupClientModule,
    AuthupHookModule,
    CacheInjectionKey,
    CacheModule,
    LoggerModule,
    TaskManager,
} from '@privateaim/server-kit';
import type { IModule } from 'orkos';
import { createFakeClient } from '@privateaim/telemetry-kit/testing';
import type { FakeHandlerMap } from '@privateaim/telemetry-kit/testing';
import type { TaskMap } from '../../src/core/domains/index.ts';
import { ConfigModule } from '../../src/app/modules/config/index.ts';
import { ComponentsInjectionKey } from '../../src/app/modules/components/index.ts';
import { AnalysisModule } from '../../src/app/modules/analysis/index.ts';
import { HTTPModule } from '../../src/app/modules/http/index.ts';
import { TelemetryClientInjectionKey } from '../../src/app/modules/telemetry-client/index.ts';

import { TestApplication } from './module.ts';
import { TestHTTPApplication } from './http.ts';
import { createTestDatabaseModule } from './database.ts';

function createTestComponentsModule(): IModule {
    return {
        name: 'components',
        dependencies: ['database'],

        async setup(container): Promise<void> {
            const cache = container.resolve(CacheInjectionKey);
            const taskManager = new TaskManager<TaskMap>(cache);
            container.register(ComponentsInjectionKey.TaskManager, { useValue: taskManager });
        },
    };
}

/**
 * Registers a transport-level fake under `TelemetryClientInjectionKey`, so the
 * telemetry-coupled controllers (`AnalysisLogController`,
 * `AnalysisNodeLogController`) can be exercised without a real telemetry
 * service. `HTTPModule` picks it up via `tryResolve`, and the real
 * `TelemetryClientModule` is not in the test module list at all — so there is
 * nothing to clobber and no guard needed.
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
        new CacheModule(),
        new AuthupHookModule(),
        new AuthupClientModule(),
        createTestDatabaseModule(),
        createTestComponentsModule(),
        new AnalysisModule(),
    ];

    if (options.telemetryHandlers) {
        // Must be registered BEFORE HTTPModule, which resolves the token while
        // constructing the log controllers.
        modules.push(createTestTelemetryClientModule(options.telemetryHandlers));
    }

    modules.push(new HTTPModule());

    return new TestHTTPApplication({ modules });
}

export function createTestDatabaseApplication(): TestApplication {
    const modules: IModule[] = [
        new ConfigModule(),
        new LoggerModule(),
        new CacheModule(),
        createTestDatabaseModule(),
        createTestComponentsModule(),
        new AnalysisModule(),
    ];

    return new TestApplication({ modules });
}
