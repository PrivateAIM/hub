/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { DataSource } from 'typeorm';
import { setDataSource } from 'typeorm-extension';
import { createConfig } from '../../src';
import { extendDataSourceOptions } from '../../src/database';

export async function useTestRuntime() {
    createConfig();

    const options = await extendDataSourceOptions({
        type: 'better-sqlite3',
        database: path.join(process.cwd(), 'writable', 'test.sql'),
    });

    Object.assign(options, {
        subscribers: [],
    });

    const dataSource = new DataSource(options);
    await dataSource.initialize();

    setDataSource(dataSource);
}
