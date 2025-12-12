/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/server-kit';
import type { DataSourceOptions } from 'typeorm';
import { readDataSourceOptionsFromEnv } from 'typeorm-extension';
import { useEnv } from '../config';
import {
    BucketEntity,
    BucketFileEntity,
    BucketFileSubscriber,
    BucketSubscriber,
} from './domains';

export async function extendDataSourceOptions(options: DataSourceOptions): Promise<DataSourceOptions> {
    options = {
        ...options,
        logging: false,
        entities: [
            ...(options.entities ? options.entities : []) as string[],
            BucketEntity,
            BucketFileEntity,
        ],
        migrations: [],
        migrationsTransactionMode: 'each',
        subscribers: [
            BucketSubscriber,
            BucketFileSubscriber,
        ],
    };

    const migrations: string[] = [];
    // const migration = await adjustFilePath(
    //    `src/database/migrations/${options.type}/*.{ts,js}`,
    // );

    // migrations.push(migration);

    Object.assign(options, {
        migrations,
    } as DataSourceOptions);

    if (options.type === 'mysql') {
        Object.assign(options, {
            connectorPackage: 'mysql2',
        } satisfies Partial<DataSourceOptions>);
    }

    return options;
}

export async function buildDataSourceOptions() : Promise<DataSourceOptions> {
    const options = readDataSourceOptionsFromEnv();
    if (!options) {
        throw new Error('The database configuration could not be read from env variables.');
    }

    if (
        options.type !== 'mysql' &&
        options.type !== 'postgres' &&
        options.type !== 'better-sqlite3'
    ) {
        throw new Error(`The database type ${options.type} is not supported.`);
    }

    if (useEnv('env') === EnvironmentName.TEST) {
        if (options.type === 'better-sqlite3') {
            Object.assign(options, {
                database: ':memory:',
            } satisfies Partial<DataSourceOptions>);
        } else {
            Object.assign(options, {
                database: 'test',
            } satisfies Partial<DataSourceOptions>);
        }
    }

    return extendDataSourceOptions(options);
}
