/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    CacheInjectionKey,
    CacheModule,
    LoggerModule,
    TaskManager,
} from '@privateaim/server-kit';
import type { IModule } from 'orkos';
import type { TaskMap } from '../../src/core/domains/index.ts';
import { ConfigModule } from '../../src/app/modules/config/index.ts';
import { ComponentsInjectionKey } from '../../src/app/modules/components/index.ts';
import { AnalysisModule } from '../../src/app/modules/analysis/index.ts';
import { HTTPModule } from '../../src/app/modules/http/index.ts';

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

export function createTestApplication(): TestHTTPApplication {
    process.env.PORT = '0';

    const modules: IModule[] = [
        new ConfigModule(),
        new LoggerModule(),
        new CacheModule(),
        createTestDatabaseModule(),
        createTestComponentsModule(),
        new AnalysisModule(),
        new HTTPModule(),
    ];

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
