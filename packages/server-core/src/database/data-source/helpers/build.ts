/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/server-kit';
import type { DataSourceOptions } from 'typeorm';
import { readDataSourceOptionsFromEnv } from 'typeorm-extension';
import { useEnv } from '../../../config/index.ts';
import { extendDataSourceOptions } from './extend.ts';

export async function buildDataSourceOptions() : Promise<DataSourceOptions> {
    const options = readDataSourceOptionsFromEnv();
    if (!options) {
        throw new Error('The database configuration could not be read from env variables.');
    }

    if (options.type !== 'mysql' && options.type !== 'postgres' && options.type !== 'better-sqlite3') {
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
