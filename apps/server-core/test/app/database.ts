/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import {
    createDatabase,
    setDataSource,
    synchronizeDatabaseSchema,
} from 'typeorm-extension';
import { DataSource } from 'typeorm';
import {
    DataSourceOptionsBuilder,
    DatabaseInjectionKey,
    registerRepositories,
} from '../../src/app/modules/database/index.ts';
import {
    AnalysisBucketFileSubscriber,
    AnalysisBucketSubscriber,
    AnalysisNodeEventSubscriber,
    AnalysisNodeSubscriber,
    AnalysisPermissionSubscriber,
    AnalysisSubscriber,
    MasterImageGroupSubscriber,
    MasterImageSubscriber,
    NodeSubscriber,
    ProjectNodeSubscriber,
    ProjectSubscriber,
    RegistryProjectSubscriber,
    RegistrySubscriber,
} from '../../src/adapters/database/subscribers/index.ts';

export function createTestDatabaseModule(): IModule {
    return {
        name: 'database',
        dependencies: [],

        async setup(container: IContainer): Promise<void> {
            const optionsBuilder = new DataSourceOptionsBuilder();

            let options;
            try {
                options = optionsBuilder.buildWithEnv();
            } catch {
                options = optionsBuilder.buildWith({
                    type: 'better-sqlite3',
                    database: ':memory:',
                });
            }

            await createDatabase({
                options,
                ifNotExist: true,
                synchronize: false,
            });

            const dataSource = new DataSource(options);
            await dataSource.initialize();
            await dataSource.synchronize();

            setDataSource(dataSource);

            container.register(DatabaseInjectionKey.DataSource, { useValue: dataSource });

            dataSource.subscribers.push(
                new NodeSubscriber(),
                new AnalysisSubscriber(),
                new AnalysisBucketFileSubscriber(),
                new AnalysisNodeSubscriber(),
                new AnalysisBucketSubscriber(),
                new AnalysisNodeEventSubscriber(),
                new AnalysisPermissionSubscriber(),
                new MasterImageSubscriber(),
                new MasterImageGroupSubscriber(),
                new ProjectSubscriber(),
                new ProjectNodeSubscriber(),
                new RegistrySubscriber(),
                new RegistryProjectSubscriber(),
            );

            registerRepositories(container, dataSource);
        },

        async teardown(container: IContainer): Promise<void> {
            const result = container.tryResolve(DatabaseInjectionKey.DataSource);
            if (result.success && result.data.isInitialized) {
                await result.data.destroy();
            }
        },
    };
}

export function createTestDatabaseModuleForSetup(): IModule {
    return {
        name: 'database',
        dependencies: [],

        async setup(): Promise<void> {
            const optionsBuilder = new DataSourceOptionsBuilder();

            let options;
            try {
                options = optionsBuilder.buildWithEnv();
            } catch {
                options = optionsBuilder.buildWith({
                    type: 'better-sqlite3',
                    database: ':memory:',
                });
            }

            await createDatabase({
                options,
                ifNotExist: true,
                synchronize: false,
            });

            const dataSource = new DataSource(options);
            await dataSource.initialize();

            await synchronizeDatabaseSchema(dataSource);
            await dataSource.synchronize();
            await dataSource.destroy();
        },
    };
}
