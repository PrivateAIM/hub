/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { inject } from 'vitest';
import type { TestProject } from 'vitest/node';
import { startAuthupContainer, startPostgresContainer } from './containers.ts';
import {
    applyDatabaseConnectionEnv,
    hasAuthupEnv,
    hasDatabaseEnv,
    resolveAuthupDatabaseEnv,
} from './env.ts';
import type { DatabaseConnection } from './types.ts';

declare module 'vitest' {
    interface ProvidedContext {
        AUTHUP_URL: string
        DATABASE_CONNECTION: DatabaseConnection | null
    }
}

/**
 * Global-setup helper: use an externally provided database when `DB_TYPE` is set,
 * otherwise start a PostgreSQL container. The resolved connection is published to
 * the test workers via `provide` (a `null` connection means "read your inherited
 * env", used for the external case).
 */
export async function provideDatabase(project: TestProject): Promise<void> {
    if (hasDatabaseEnv()) {
        project.provide('DATABASE_CONNECTION', null);
        return;
    }

    const connection = await startPostgresContainer();
    applyDatabaseConnectionEnv(connection);
    project.provide('DATABASE_CONNECTION', connection);
}

/**
 * Global-setup helper: use an externally provided Authup instance when
 * `AUTHUP_URL` is set, otherwise start an Authup container provisioned with the
 * given permission names (the set the calling service actually checks). The
 * resolved URL is published to the test workers.
 */
export async function provideAuthup(project: TestProject, permissionNames: string[]): Promise<void> {
    if (hasAuthupEnv()) {
        project.provide('AUTHUP_URL', process.env.AUTHUP_URL as string);
        return;
    }

    const url = await startAuthupContainer(permissionNames, resolveAuthupDatabaseEnv());
    process.env.AUTHUP_URL = url;
    project.provide('AUTHUP_URL', url);
}

/**
 * Worker-side helper: hydrate `process.env` from the values published during
 * global setup, so the config module resolves the same database and Authup URL.
 * Called from a `setupFiles` entry (before the test application is built).
 */
export function hydrateTestEnv(): void {
    const connection = inject('DATABASE_CONNECTION');
    if (connection) {
        applyDatabaseConnectionEnv(connection);
    }

    const authupURL = inject('AUTHUP_URL');
    if (authupURL) {
        process.env.AUTHUP_URL = authupURL;
    }
}
