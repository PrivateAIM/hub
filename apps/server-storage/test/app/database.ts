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
} from 'typeorm-extension';
import { DataSource } from 'typeorm';
import {
    DataSourceOptionsBuilder,
    DatabaseInjectionKey,
} from '../../src/app/modules/database/index.ts';
import { BucketSubscriber } from '../../src/adapters/database/subscribers/bucket.ts';
import { BucketFileSubscriber } from '../../src/adapters/database/subscribers/bucket-file.ts';

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

            // Subscribers must be pushed after initialize()
            dataSource.subscribers.push(
                new BucketSubscriber(),
                new BucketFileSubscriber(),
            );

            container.register(DatabaseInjectionKey.DataSource, { useValue: dataSource });
        },

        async teardown(container: IContainer): Promise<void> {
            const result = container.tryResolve(DatabaseInjectionKey.DataSource);
            if (result.success && result.data.isInitialized) {
                await result.data.destroy();
            }
        },
    };
}
