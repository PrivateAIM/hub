/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { StartedTestContainer } from 'testcontainers';
import { GenericContainer, Wait } from 'testcontainers';
import { buildAuthupProvisioningModule } from './provisioning.ts';
import type { DatabaseConnection } from './types.ts';

const AUTHUP_IMAGE = 'authup/authup';
const AUTHUP_PORT = 3000;
const AUTHUP_PROVISIONING_TARGET = '/usr/src/app/writable/provisioning/hub.mjs';

const POSTGRES_IMAGE = 'postgres:18';
const POSTGRES_PORT = 5432;
const POSTGRES_PASSWORD = 'start123';
const POSTGRES_DATABASE = 'app';

const STARTUP_TIMEOUT = 180_000;

/**
 * Containers started during global setup, stopped in {@link stopTestContainers}.
 */
const containers: StartedTestContainer[] = [];

/**
 * Start an Authup instance with the hub provisioning file mounted. The container
 * ships with an in-memory SQLite database, the `system` client, and the default
 * `admin`/`start123` master-realm user — matching the credentials the test HTTP
 * clients authenticate with.
 */
export async function startAuthupContainer(): Promise<string> {
    const container = await new GenericContainer(AUTHUP_IMAGE)
        .withExposedPorts(AUTHUP_PORT)
        .withEnvironment({
            NODE_ENV: 'development',
            DB_TYPE: 'better-sqlite3',
            DB_DATABASE: ':memory:',
            CLIENT_SYSTEM_ENABLED: 'true',
            CLIENT_SYSTEM_SECRET: 'start123',
            CLIENT_SYSTEM_SECRET_RESET: 'true',
            USER_ADMIN_PASSWORD: 'start123',
            USER_ADMIN_PASSWORD_RESET: 'true',
        })
        .withCopyContentToContainer([
            {
                content: buildAuthupProvisioningModule(),
                target: AUTHUP_PROVISIONING_TARGET,
            },
        ])
        .withWaitStrategy(Wait.forHttp('/', AUTHUP_PORT).forStatusCode(200))
        .withStartupTimeout(STARTUP_TIMEOUT)
        .start();

    containers.push(container);

    return `http://${container.getHost()}:${container.getMappedPort(AUTHUP_PORT)}/`;
}

/**
 * Start a PostgreSQL instance and return its connection details.
 */
export async function startPostgresContainer(): Promise<DatabaseConnection> {
    const container = await new GenericContainer(POSTGRES_IMAGE)
        .withExposedPorts(POSTGRES_PORT)
        .withEnvironment({
            POSTGRES_PASSWORD,
            POSTGRES_DB: POSTGRES_DATABASE,
        })
        .withWaitStrategy(
            Wait.forLogMessage(/database system is ready to accept connections/, 2),
        )
        .withStartupTimeout(STARTUP_TIMEOUT)
        .start();

    containers.push(container);

    return {
        type: 'postgres',
        host: container.getHost(),
        port: container.getMappedPort(POSTGRES_PORT),
        username: 'postgres',
        password: POSTGRES_PASSWORD,
        database: POSTGRES_DATABASE,
    };
}

/**
 * Stop every container started during global setup.
 */
export async function stopTestContainers(): Promise<void> {
    await Promise.all(containers.map((container) => container.stop()));
    containers.length = 0;
}
