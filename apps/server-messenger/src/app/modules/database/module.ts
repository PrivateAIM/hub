/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { DataSource } from 'typeorm';
import {
    checkDatabase,
    createDatabase,
    setDataSource,
    synchronizeDatabaseSchema,
} from 'typeorm-extension';
import { DataSourceOptionsBuilder } from './options.ts';
import { DatabaseInjectionKey } from './constants.ts';
import { registerRepositories } from './register.ts';

export class DatabaseModule implements IModule {
    readonly name = 'database';

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

        registerRepositories(container, dataSource);
    }

    async teardown(container: IContainer): Promise<void> {
        const result = container.tryResolve(DatabaseInjectionKey.DataSource);
        if (result.success && result.data.isInitialized) {
            await result.data.destroy();
        }
    }
}
