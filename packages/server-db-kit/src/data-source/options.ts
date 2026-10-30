/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DataSourceOptionsEntities, DataSourceOptionsSubscribers } from './types.ts';

import type { DataSourceOptions } from 'typeorm';
import {
    CodeTransformation,
    isCodeTransformation,
    pinTimezone,
    readDataSourceOptionsFromEnv,
    transformFilePath,
} from 'typeorm-extension';




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
                // 'each', never 'all': under 'all' every pending migration fuses
                // into ONE postgres transaction, so a lock the first migration
                // takes is held across every later one — AlignAnalysesConstraintNames'
                // ACCESS EXCLUSIVE on `analyses` (its first RENAME CONSTRAINT)
                // would span QueryIndexes' entire 58-index build, blocking reads
                // on the busiest table for the whole window at pod boot. 'each'
                // commits per migration, keeping every postgres migration atomic
                // on its own; MySQL auto-commits DDL statement by statement
                // regardless, so 'all' never bought it anything there.
                migrationsTransactionMode: 'each',
            } as DataSourceOptions);
        }

        // `created_at` / `updated_at` are zone-less: the database stamps them
        // in its SESSION timezone and the driver reads them in the PROCESS
        // timezone, while a bound `Date` (the messenger's expiry sweep) is
        // written in the process timezone too. All three halves are pinned to UTC, on
        // every path that builds options (boot, migration CLI, tests). A
        // setting contradicting the pin throws an `OptionsError` here rather
        // than being half applied. better-sqlite3 passes through unchanged.
        return pinTimezone(options, 'UTC');
    }
}
