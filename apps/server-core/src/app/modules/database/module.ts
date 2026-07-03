/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import {
    AUTHUP_CLIENT_MODULE_NAME,
    AuthupClientInjectionKey,
    ENTITY_EVENT_MODULE_NAME,
    EntityEventPublisherInjectionKey,
} from '@privateaim/server-kit';
import {
    checkDatabase,
    createDatabase,
    setDataSource,
    synchronizeDatabaseSchema,
} from 'typeorm-extension';
import {
    AnalysisBucketFileSubscriber,
    AnalysisBucketSubscriber,
    AnalysisNodeEventSubscriber,
    AnalysisNodeSubscriber,
    AnalysisSubscriber,
    MasterImageGroupSubscriber,
    MasterImageSubscriber,
    NodeSubscriber,
    ProjectNodeSubscriber,
    ProjectSubscriber,
    RegistryProjectSubscriber,
    RegistrySubscriber,
} from '../../../adapters/database/subscribers/index.ts';
import { NodeClientService } from './node-client.ts';
import { AnalysisClientService } from './analysis-client.ts';
import { DataSourceOptionsBuilder } from './options.ts';
import { DatabaseInjectionKey } from './constants.ts';
import { registerRepositories } from './register.ts';
import { DataSource } from 'typeorm';

export class DatabaseModule implements IModule {
    readonly name = 'database';

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: ENTITY_EVENT_MODULE_NAME, optional: true },
        { name: AUTHUP_CLIENT_MODULE_NAME, optional: true },
    ];

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

        const dataSource = new DataSource(options);

        try {
            await dataSource.initialize();

            // Subscribers must be pushed after initialize(), because
            // initialize() overwrites dataSource.subscribers from options.
            this.registerSubscribers(dataSource, container);

            setDataSource(dataSource);

            if (!check.schema) {
                await synchronizeDatabaseSchema(dataSource);
            }

            container.register(DatabaseInjectionKey.DataSource, { useValue: dataSource });

            registerRepositories(container, dataSource);
        } catch (e) {
            if (dataSource.isInitialized) {
                await dataSource.destroy();
            }
            throw e;
        }
    }

    async teardown(container: IContainer): Promise<void> {
        const result = container.tryResolve(DatabaseInjectionKey.DataSource);
        if (result.success && result.data.isInitialized) {
            await result.data.destroy();
        }
    }

    private registerSubscribers(dataSource: DataSource, container: IContainer): void {
        let nodeClientService: NodeClientService | undefined;
        let analysisClientService: AnalysisClientService | undefined;
        const authupResult = container.tryResolve(AuthupClientInjectionKey);
        if (authupResult.success) {
            nodeClientService = new NodeClientService(authupResult.data);
            analysisClientService = new AnalysisClientService(authupResult.data);
        }

        const subscribers = [
            new NodeSubscriber({ nodeClientService }),
            new AnalysisSubscriber({ analysisClientService }),
            new AnalysisBucketFileSubscriber(),
            new AnalysisNodeSubscriber(),

            new AnalysisBucketSubscriber(),
            new AnalysisNodeEventSubscriber(),
            new MasterImageSubscriber(),
            new MasterImageGroupSubscriber(),
            new ProjectSubscriber(),
            new ProjectNodeSubscriber(),
            new RegistrySubscriber(),
            new RegistryProjectSubscriber(),
        ];

        const publisherResult = container.tryResolve(EntityEventPublisherInjectionKey);
        if (publisherResult.success) {
            for (const subscriber of subscribers) {
                subscriber.setPublisher(publisherResult.data);
            }
        }

        dataSource.subscribers.push(...subscribers);
    }
}
