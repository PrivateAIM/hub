/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DatabaseConnection } from './types.ts';

/**
 * Whether the database is provided externally (e.g. a CI workflow service).
 * When a `DB_TYPE` is configured, tests use it as-is; otherwise a container is
 * started. This mirrors Authup's own suite (external is opt-in via env).
 */
export function hasDatabaseEnv(): boolean {
    return typeof process.env.DB_TYPE === 'string' && process.env.DB_TYPE.length > 0;
}

/**
 * Whether an Authup instance is provided externally.
 */
export function hasAuthupEnv(): boolean {
    return typeof process.env.AUTHUP_URL === 'string' && process.env.AUTHUP_URL.length > 0;
}

/**
 * Write a resolved database connection into `process.env` so the datasource
 * builder (`readDataSourceOptionsFromEnv`) picks it up.
 */
export function applyDatabaseConnectionEnv(connection: DatabaseConnection): void {
    process.env.DB_TYPE = connection.type;
    process.env.DB_HOST = connection.host;
    process.env.DB_PORT = String(connection.port);
    process.env.DB_USERNAME = connection.username;
    process.env.DB_PASSWORD = connection.password;
    process.env.DB_DATABASE = connection.database;
}

/**
 * Derive the database environment for the Authup container from hub's resolved
 * database, so Authup runs on the same engine as the service under test in every
 * environment (local + each CI matrix leg).
 *
 * - SQLite (or no configured engine) keeps Authup self-contained on its own
 *   in-memory store — an in-memory SQLite cannot be shared across processes.
 * - MySQL / PostgreSQL reuse the same server on a dedicated `authup` database
 *   (Authup creates it on boot). The Authup container reaches the server — a
 *   host-published testcontainer port locally, a workflow-service port in CI —
 *   via `host.docker.internal` (mapped to the host gateway on Linux).
 */
export function resolveAuthupDatabaseEnv(): Record<string, string> {
    const type = process.env.DB_TYPE;

    if (!type || type === 'better-sqlite3' || type === 'sqlite') {
        return {
            DB_TYPE: 'better-sqlite3',
            DB_DATABASE: ':memory:',
        };
    }

    return {
        DB_TYPE: type,
        DB_HOST: 'host.docker.internal',
        DB_PORT: process.env.DB_PORT ?? (type === 'mysql' ? '3306' : '5432'),
        DB_USERNAME: process.env.DB_USERNAME ?? '',
        DB_PASSWORD: process.env.DB_PASSWORD ?? '',
        DB_DATABASE: 'authup',
    };
}
