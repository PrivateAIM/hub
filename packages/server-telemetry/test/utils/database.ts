/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    createDatabase,
    dropDatabase,
    setDataSource,
    synchronizeDatabaseSchema,
    unsetDataSource,
    useDataSource,
} from 'typeorm-extension';
import {
    DataSource, type DataSourceOptions,
} from 'typeorm';
import { DataSourceOptionsBuilder } from '../../src/database';

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

    await dropDatabase({ options, ifExist: true });
    await createDatabase({ options, synchronize: false });
    await synchronizeDatabaseSchema(options);

    const dataSource = new DataSource(options);
    await dataSource.initialize();

    setDataSource(dataSource);

    return dataSource;
}

export async function dropTestDatabase() {
    const dataSource = await useDataSource();
    await dataSource.destroy();

    const { options } = dataSource;

    unsetDataSource();

    await dropDatabase({ ifExist: true, options });
}
