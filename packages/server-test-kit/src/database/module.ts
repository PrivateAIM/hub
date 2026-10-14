/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createDatabase, dropDatabase } from 'typeorm-extension';
import type { DatabaseConnection } from '../testcontainers/types.ts';

const DEFAULT_DATABASE = 'app';

const DEFAULT_PORTS: Record<DatabaseConnection['type'], number> = {
    mysql: 3306,
    postgres: 5432,
};

/**
 * Whether `type` names a database SERVER — one that several suites can reach
 * at once. SQLite (in-memory, per process) is never shared, so it needs no
 * per-suite database.
 */
export function isServerDatabaseType(type: string | undefined): type is DatabaseConnection['type'] {
    return type === 'mysql' || type === 'postgres';
}

/**
 * The database a suite runs against on a shared server: `<base>_<suite>`.
 *
 * Every hub service suite runs concurrently against the ONE database server CI
 * provides, and they used to share `DB_DATABASE=app`. Each worker then called a
 * check-then-create `createDatabase({ ifNotExist: true })`, which races — the
 * loser failed its whole run with `Key (datname)=(app) already exists` — and the
 * suites' schemas collided in one database. A database per suite removes the
 * shared resource instead of tolerating the race (authup's suite gives each
 * secondary instance its own `${base}_${name}_${pool}` database the same way).
 */
export function buildSuiteDatabaseName(base: string | undefined, suite: string): string {
    if (!/^[a-z][a-z0-9_]*$/.test(suite)) {
        throw new SyntaxError(`The suite name "${suite}" is not a valid database name segment ([a-z][a-z0-9_]*).`);
    }

    const prefix = typeof base === 'string' && base.length > 0 ? base : DEFAULT_DATABASE;

    return `${prefix}_${suite}`;
}

/**
 * Read an externally configured database server connection (CI workflow
 * service, `test:mysql` / `test:psql`) from the `DB_*` environment.
 */
export function readDatabaseConnectionEnv(): DatabaseConnection | undefined {
    const type = process.env.DB_TYPE;
    if (!isServerDatabaseType(type)) {
        return undefined;
    }

    return {
        type,
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT, 10) : DEFAULT_PORTS[type],
        username: process.env.DB_USERNAME || (type === 'mysql' ? 'root' : 'postgres'),
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || DEFAULT_DATABASE,
    };
}

/**
 * Drop and re-create the suite's database. Runs ONCE, in vitest global setup,
 * before any worker exists — so workers never race on its `CREATE DATABASE`
 * and the suite's own database starts every run empty. A database a suite
 * derives from it per worker (server-core's `<suite db>_<pool id>`) is not
 * dropped here and keeps its rows across runs.
 */
export async function recreateDatabase(connection: DatabaseConnection): Promise<void> {
    const options = {
        type: connection.type,
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: connection.password,
        database: connection.database,
    };

    await dropDatabase({ options, ifExist: true });
    await createDatabase({
        options, 
        ifNotExist: true, 
        synchronize: false, 
    });
}
