/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { BucketComponentCaller } from '@privateaim/server-storage-kit';
import {
    AuthupClientInjectionKey,
    isAuthupClientUsable,
} from '@privateaim/server-kit';
import {
    checkDatabase,
    createDatabase,
    setDataSource,
    synchronizeDatabaseSchema,
} from 'typeorm-extension';
import { useTaskManager } from '../../../core/domains/index.ts';
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
} from '../../../adapters/database/subscribers/index.ts';
import { useAnalysisMetadataComponentCaller } from '../../components/index.ts';
import { NodeClientService } from './node-client.ts';
import { DataSourceOptionsBuilder } from './options.ts';
import { setDataSourceSync } from './singleton.ts';
import { DatabaseInjectionKey } from './constants.ts';
import { registerRepositories } from './register.ts';

export class DatabaseModule implements IModule {
    readonly name = 'database';

    readonly dependencies: string[] = [];

    async setup(container: IContainer): Promise<void> {
        const optionsBuilder = new DataSourceOptionsBuilder();
        const options = optionsBuilder.buildWithEnv();

        const check = await checkDatabase({
            options,
            dataSourceCleanup: true,
        });

        if (!check.exists) {
            await createDatabase({
                options,
                synchronize: false,
                ifNotExist: true,
            });
        }

        const { DataSource: DS } = await import('typeorm');
        const dataSource = new DS(options);

        // Instantiate subscribers with DI dependencies
        this.registerSubscribers(dataSource, container);

        await dataSource.initialize();

        try {
            setDataSource(dataSource);
            setDataSourceSync(dataSource);

            if (!check.schema) {
                await synchronizeDatabaseSchema(dataSource);
            }
        } catch (e) {
            await dataSource.destroy();
            throw e;
        }

        container.register(DatabaseInjectionKey.DataSource, { useValue: dataSource });

        registerRepositories(container, dataSource);
    }

    async teardown(container: IContainer): Promise<void> {
        const result = container.tryResolve(DatabaseInjectionKey.DataSource);
        if (result.success && result.data.isInitialized) {
            await result.data.destroy();
        }
    }

    private registerSubscribers(dataSource: any, container: IContainer): void {
        let metadataCaller: any;
        try {
            metadataCaller = useAnalysisMetadataComponentCaller();
        } catch {
            // not available (e.g. in tests)
        }

        let nodeClientService: NodeClientService | undefined;
        if (isAuthupClientUsable()) {
            const authupResult = container.tryResolve(AuthupClientInjectionKey);
            if (authupResult.success) {
                nodeClientService = new NodeClientService(authupResult.data);
            }
        }

        let taskManager: any;
        try {
            taskManager = useTaskManager();
        } catch {
            // not available
        }

        dataSource.subscribers.push(
            new NodeSubscriber({ nodeClientService }),
            new AnalysisSubscriber({
                metadataCaller,
                bucketCaller: new BucketComponentCaller(),
                taskManager,
            }),
            new AnalysisBucketFileSubscriber({ metadataCaller }),
            new AnalysisNodeSubscriber({ metadataCaller }),

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
    }
}
