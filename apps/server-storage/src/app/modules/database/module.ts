/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { EntityEventPublisherInjectionKey } from '@privateaim/server-kit';
import { DataSource } from 'typeorm';
import {
    checkDatabase,
    createDatabase,
    setDataSource,
    synchronizeDatabaseSchema,
} from 'typeorm-extension';
import { BucketSubscriber } from '../../../adapters/database/subscribers/bucket.ts';
import { BucketFileSubscriber } from '../../../adapters/database/subscribers/bucket-file.ts';
import { DataSourceOptionsBuilder } from './options.ts';
import { DatabaseInjectionKey } from './constants.ts';

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

        const dataSource = new DataSource(options);
        await dataSource.initialize();

        // Subscribers must be pushed after initialize(), because
        // initialize() overwrites dataSource.subscribers from options.
        const subscribers = [
            new BucketSubscriber(),
            new BucketFileSubscriber(),
        ];

        const publisherResult = container.tryResolve(EntityEventPublisherInjectionKey);
        if (publisherResult.success) {
            for (const subscriber of subscribers) {
                subscriber.setPublisher(publisherResult.data);
            }
        }

        dataSource.subscribers.push(...subscribers);

        try {
            setDataSource(dataSource);

            if (!check.schema) {
                await synchronizeDatabaseSchema(dataSource);
            }
        } catch (e) {
            await dataSource.destroy();
            throw e;
        }

        container.register(DatabaseInjectionKey.DataSource, { useValue: dataSource });
    }

    async teardown(container: IContainer): Promise<void> {
        const result = container.tryResolve(DatabaseInjectionKey.DataSource);
        if (result.success && result.data.isInitialized) {
            await result.data.destroy();
        }
    }
}
