/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum EnvironmentInputKey {
    ENV = 'NODE_ENV',
    PORT = 'PORT',

    RABBITMQ_CONNECTION_STRING = 'RABBITMQ_CONNECTION_STRING',
    REDIS_CONNECTION_STRING = 'REDIS_CONNECTION_STRING',
    VAULT_CONNECTION_STRING = 'VAULT_CONNECTION_STRING',
    LOKI_URL = 'LOKI_URL',
    LOKI_COMPACTOR_URL = 'LOKI_COMPACTOR_URL',
    LOKI_QUERIER_URL = 'LOKI_QUERIER_URL',
    AUTHUP_URL = 'AUTHUP_URL',

    PUBLIC_URL = 'PUBLIC_URL',
}
