/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { StartedNetwork, StartedTestContainer } from 'testcontainers';
import { GenericContainer, Network, Wait } from 'testcontainers';
import { buildAuthupProvisioningModule } from './provisioning.ts';
import type { DatabaseConnection } from './types.ts';

const AUTHUP_IMAGE = 'authup/authup';
const AUTHUP_PORT = 3000;
const AUTHUP_PROVISIONING_TARGET = '/usr/src/app/writable/provisioning/hub.mjs';

const POSTGRES_IMAGE = 'postgres:18';
const POSTGRES_PORT = 5432;

const MYSQL_IMAGE = 'mysql:9';
const MYSQL_PORT = 3306;

const DATABASE_PASSWORD = 'start123';
const HUB_DATABASE = 'app';

// Alias + database name for Authup's own database container, reached by the
// Authup container over the shared network.
const AUTHUP_DATABASE_ALIAS = 'database';
const AUTHUP_DATABASE_NAME = 'authup';

const STARTUP_TIMEOUT = 180_000;

/**
 * Containers started during global setup, stopped in {@link stopTestContainers}.
 */
const containers: StartedTestContainer[] = [];

/**
 * Networks started during global setup, stopped in {@link stopTestContainers}.
 */
const networks: StartedNetwork[] = [];

/**
 * Start Authup's own database (matching hub's engine) on the given network,
 * reachable from the Authup container at {@link AUTHUP_DATABASE_ALIAS}. The
 * database is internal to the network — no host port is published — so Authup
 * reaches it by container alias, which works identically locally and in CI.
 * Returns the `DB_*` environment for the Authup container.
 */
async function startAuthupDatabaseContainer(
    type: string,
    network: StartedNetwork,
): Promise<Record<string, string>> {
    if (type === 'mysql') {
        const container = await new GenericContainer(MYSQL_IMAGE)
            .withNetwork(network)
            .withNetworkAliases(AUTHUP_DATABASE_ALIAS)
            .withEnvironment({
                MYSQL_ROOT_PASSWORD: DATABASE_PASSWORD,
                MYSQL_DATABASE: AUTHUP_DATABASE_NAME,
            })
            .withWaitStrategy(Wait.forLogMessage(/ready for connections/, 2))
            .withStartupTimeout(STARTUP_TIMEOUT)
            .start();

        containers.push(container);

        return {
            DB_TYPE: 'mysql',
            DB_HOST: AUTHUP_DATABASE_ALIAS,
            DB_PORT: String(MYSQL_PORT),
            DB_USERNAME: 'root',
            DB_PASSWORD: DATABASE_PASSWORD,
            DB_DATABASE: AUTHUP_DATABASE_NAME,
        };
    }

    const container = await new GenericContainer(POSTGRES_IMAGE)
        .withNetwork(network)
        .withNetworkAliases(AUTHUP_DATABASE_ALIAS)
        .withEnvironment({
            POSTGRES_PASSWORD: DATABASE_PASSWORD,
            POSTGRES_DB: AUTHUP_DATABASE_NAME,
        })
        .withWaitStrategy(
            Wait.forLogMessage(/database system is ready to accept connections/, 2),
        )
        .withStartupTimeout(STARTUP_TIMEOUT)
        .start();

    containers.push(container);

    return {
        DB_TYPE: 'postgres',
        DB_HOST: AUTHUP_DATABASE_ALIAS,
        DB_PORT: String(POSTGRES_PORT),
        DB_USERNAME: 'postgres',
        DB_PASSWORD: DATABASE_PASSWORD,
        DB_DATABASE: AUTHUP_DATABASE_NAME,
    };
}

/**
 * Start an Authup instance provisioned with the given permission names. It ships
 * with the `system` client and the default `admin`/`start123` master-realm user —
 * matching the credentials the test HTTP clients authenticate with.
 *
 * `databaseEnv` (see {@link resolveAuthupDatabaseEnv}) selects the engine. For an
 * external engine (`mysql`/`postgres`) Authup gets its own database container on a
 * shared network and reaches it by container alias — plain container-to-container
 * networking that is reliable both locally and in CI, unlike reaching a
 * host-published database across the container boundary. SQLite runs
 * self-contained inside the Authup container.
 */
export async function startAuthupContainer(
    permissionNames: string[],
    databaseEnv: Record<string, string>,
): Promise<string> {
    let builder = new GenericContainer(AUTHUP_IMAGE).withExposedPorts(AUTHUP_PORT);
    let resolvedDatabaseEnv = databaseEnv;

    if (databaseEnv.DB_TYPE !== 'better-sqlite3') {
        const network = await new Network().start();
        networks.push(network);

        resolvedDatabaseEnv = await startAuthupDatabaseContainer(databaseEnv.DB_TYPE, network);
        builder = builder.withNetwork(network);
    }

    const container = await builder
        .withEnvironment({
            NODE_ENV: 'development',
            CLIENT_SYSTEM_ENABLED: 'true',
            CLIENT_SYSTEM_SECRET: 'start123',
            CLIENT_SYSTEM_SECRET_RESET: 'true',
            USER_ADMIN_PASSWORD: 'start123',
            USER_ADMIN_PASSWORD_RESET: 'true',
            ...resolvedDatabaseEnv,
        })
        .withCopyContentToContainer([
            {
                content: buildAuthupProvisioningModule(permissionNames),
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
 * Start a PostgreSQL instance for hub and return its (host-published) connection
 * details.
 */
export async function startPostgresContainer(): Promise<DatabaseConnection> {
    const container = await new GenericContainer(POSTGRES_IMAGE)
        .withExposedPorts(POSTGRES_PORT)
        .withEnvironment({
            POSTGRES_PASSWORD: DATABASE_PASSWORD,
            POSTGRES_DB: HUB_DATABASE,
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
        password: DATABASE_PASSWORD,
        database: HUB_DATABASE,
    };
}

/**
 * Stop every container and network started during global setup.
 */
export async function stopTestContainers(): Promise<void> {
    await Promise.all(containers.map((container) => container.stop()));
    containers.length = 0;

    await Promise.all(networks.map((network) => network.stop()));
    networks.length = 0;
}
