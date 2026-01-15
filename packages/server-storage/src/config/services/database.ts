/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DataSource } from 'typeorm';
import {
    checkDatabase, createDatabase, setDataSource, synchronizeDatabaseSchema,
} from 'typeorm-extension';
import { buildDataSourceOptions } from '../../database/index.ts';

export async function setupDatabase() {
    const options = await buildDataSourceOptions();
    const check = await checkDatabase({
        options,
        dataSourceCleanup: true,
    });

    if (!check.exists) {
        await createDatabase({ options, synchronize: false, ifNotExist: true });
    }

    const dataSource = new DataSource(options);
    await dataSource.initialize();

    setDataSource(dataSource);

    if (!check.schema) {
        await synchronizeDatabaseSchema(dataSource);
    }
}
