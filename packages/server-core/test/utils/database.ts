/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { wait } from '@privateaim/kit';
import {
    createDatabase,
    setDataSource,
    synchronizeDatabaseSchema,
    unsetDataSource,
    useDataSource,
} from 'typeorm-extension';
import {
    DataSource,
    type DataSourceOptions,
} from 'typeorm';
import {
    DataSourceOptionsBuilder,
    setDataSourceSync,
    unsetDataSourceSync,
} from '../../src/database/index.ts';

export async function useTestDatabase() {
    const optionsBuilder = new DataSourceOptionsBuilder();
    let options : DataSourceOptions;
    try {
        options = optionsBuilder.buildWithEnv();
    } catch (e) {
        options = optionsBuilder.buildWith({
            type: 'better-sqlite3',
            database: ':memory:',
        });
    }

    await createDatabase({ options, synchronize: false });

    const dataSource = new DataSource(options);
    await dataSource.initialize();

    await synchronizeDatabaseSchema(dataSource);

    await dataSource.synchronize();

    setDataSource(dataSource);
    setDataSourceSync(dataSource);

    return dataSource;
}

export async function dropTestDatabase() {
    const dataSource = await useDataSource();
    await wait(0);
    await dataSource.destroy();

    unsetDataSource();
    unsetDataSourceSync();
}
