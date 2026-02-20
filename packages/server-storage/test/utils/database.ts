/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { wait } from '@privateaim/kit';
import {
    setDataSource,
    synchronizeDatabaseSchema,
    unsetDataSource,
} from 'typeorm-extension';
import type { DataSourceOptions } from 'typeorm';
import {
    DataSource,
} from 'typeorm';
import { DataSourceOptionsBuilder } from '../../src/database/index.ts';

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
    }

    async up() {
        const dataSource = await this.getDatSource();
        await dataSource.synchronize();

        setDataSource(dataSource);
    }

    async down() {
        const dataSource = await this.getDatSource();
        await wait(0);
        await dataSource.destroy();

        unsetDataSource();
    }
}
