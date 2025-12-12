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
    unsetDataSource,
    useDataSource,
} from 'typeorm-extension';
import {
    DataSource,
} from 'typeorm';
import { extendDataSourceOptions, setDataSourceSync, unsetDataSourceSync } from '../../src/database';

export async function useTestDatabase() {
    const options = await extendDataSourceOptions({
        type: 'better-sqlite3',
        database: ':memory:',
    });

    await dropDatabase({ options, ifExist: true });
    await createDatabase({ options, synchronize: false });

    const dataSource = new DataSource(options);
    await dataSource.initialize();
    await dataSource.synchronize();

    setDataSource(dataSource);
    setDataSourceSync(dataSource);

    return dataSource;
}

export async function dropTestDatabase() {
    const dataSource = await useDataSource();
    await dataSource.destroy();

    const { options } = dataSource;

    unsetDataSource();
    unsetDataSourceSync();

    await dropDatabase({ ifExist: true, options });
}
