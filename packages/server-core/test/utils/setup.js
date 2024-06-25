/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { dropDatabase, createDatabase, setDataSource } = require('typeorm-extension');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DataSource } = require('typeorm');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('node:path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { extendDataSourceOptions } = require('../../src/database');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createConfig } = require('../../src');

module.exports = async () => {
    createConfig();

    const options = await extendDataSourceOptions({
        type: 'better-sqlite3',
        database: path.join(process.cwd(), 'writable', 'test.sql'),
    });

    await dropDatabase({ options, ifExist: true });
    await createDatabase({ options, synchronize: false });

    const dataSource = new DataSource(options);
    await dataSource.initialize();
    await dataSource.synchronize();

    setDataSource(dataSource);
};
