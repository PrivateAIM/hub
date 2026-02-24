/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    createDatabase,
    setDataSource,
    synchronizeDatabaseSchema,
    unsetDataSource,
} from 'typeorm-extension';
import {
    DataSource,
    type DataSourceOptions,
} from 'typeorm';
import {
    DataSourceOptionsBuilder, setDataSourceSync, unsetDataSourceSync,
} from '../../src/database/index.ts';

export class TestDatabase {
    protected options : DataSourceOptions | undefined;

    protected instance : DataSource | undefined;

    protected async getOptions() : Promise<DataSourceOptions> {
        if (this.options) {
            return this.options;
        }

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

        this.options = options;
        return this.options;
    }

    protected async getDatSource() : Promise<DataSource> {
        if (this.instance) {
            return this.instance;
        }

        const options = await this.getOptions();
        await createDatabase({ options, ifNotExist: true, synchronize: false });

        const dataSource = new DataSource(options);
        await dataSource.initialize();

        this.instance = dataSource;
        return this.instance;
    }

    async setup() {
        const dataSource = await this.getDatSource();
        await synchronizeDatabaseSchema(dataSource);

        await dataSource.synchronize();
        await dataSource.destroy();

        this.instance = undefined;
    }

    async up() {
        const dataSource = await this.getDatSource();
        await dataSource.synchronize();

        setDataSource(dataSource);
        setDataSourceSync(dataSource);
    }

    async down() {
        const dataSource = await this.getDatSource();
        await dataSource.destroy();

        unsetDataSource();
        unsetDataSourceSync();

        this.instance = undefined;
    }
}
