/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DataSourceOptions } from 'typeorm';
import {
    CodeTransformation,
    isCodeTransformation,
    readDataSourceOptionsFromEnv,
    transformFilePath,
} from 'typeorm-extension';

export type DataSourceOptionsEntities = DataSourceOptions['entities'];
export type DataSourceOptionsSubscribers = DataSourceOptions['subscribers'];

export class DataSourceOptionsBuilder {
    protected entities : DataSourceOptionsEntities;

    protected subscribers : DataSourceOptionsSubscribers;

    protected migrationDirectory: string;

    // ------------------------------------------------------------------

    constructor() {
        this.entities = [];
        this.subscribers = [];
        this.migrationDirectory = 'src/database/migrations';
    }

    // ------------------------------------------------------------------

    buildWithEnv() {
        const options = readDataSourceOptionsFromEnv();

        if (!options) {
            throw new Error('The database configuration could not be read from env variables.');
        }

        return this.normalize(options);
    }

    buildWith(options: DataSourceOptions) {
        return this.normalize(options);
    }

    // ------------------------------------------------------------------

    setEntities(entities: DataSourceOptionsEntities) {
        this.entities = entities;
    }

    setSubscribers(subscribers: DataSourceOptionsSubscribers) {
        this.subscribers = subscribers;
    }

    setMigrationDirectory(directory: string) {
        this.migrationDirectory = directory;
    }

    // ------------------------------------------------------------------

    protected normalize(options: DataSourceOptions) : DataSourceOptions {
        if (
            options.type !== 'mysql' &&
            options.type !== 'postgres' &&
            options.type !== 'better-sqlite3'
        ) {
            throw new Error(`The database type ${options.type} is not supported.`);
        }

        options = {
            ...options,
            logging: false,
            entities: [
                ...(options.entities ? options.entities : []) as string[],
                ...(this.entities) as string[],
            ],
            migrations: [],
            migrationsTransactionMode: 'each',
            subscribers: [
                ...(options.subscribers || []) as string[],
                ...this.subscribers as string[],
            ],
        };

        if (options.type === 'mysql' || options.type === 'postgres') {
            let migrationPath = `${this.migrationDirectory}/${options.type}/*.{ts,js,mjs}`;
            if (!isCodeTransformation(CodeTransformation.JUST_IN_TIME)) {
                migrationPath = transformFilePath(migrationPath, './dist', './src');
            }

            Object.assign(options, {
                migrations: [migrationPath],
                migrationsTransactionMode: 'all',
            } as DataSourceOptions);
        }

        if (options.type === 'mysql') {
            Object.assign(options, { connectorPackage: 'mysql2' } satisfies Partial<DataSourceOptions>);
        }

        return options;
    }
}
