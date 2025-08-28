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
    HARBOR_URL = 'HARBOR_URL',

    AUTHUP_URL = 'AUTHUP_URL',
    TELEMETRY_URL = 'TELEMETRY_URL',

    PUBLIC_URL = 'PUBLIC_URL',

    MASTER_IMAGES_OWNER = 'MASTER_IMAGES_OWNER',
    MASTER_IMAGES_REPOSITORY = 'MASTER_IMAGES_REPOSITORY',
    MASTER_IMAGES_BRANCH = 'MASTER_IMAGES_BRANCH',

    SKIP_PROJECT_APPROVAL = 'SKIP_PROJECT_APPROVAL',
    SKIP_ANALYSIS_APPROVAL = 'SKIP_ANALYSIS_APPROVAL',
}

export enum EnvironmentDefaults {
    REDIS = 'redis://127.0.0.1',
    RABBITMQ = 'amqp://root:start123@127.0.0.1',
    VAULT = 'start123@http://127.0.0.1:8090/v1/',
    MASTER_IMAGES_OWNER = 'PrivateAim',
    MASTER_IMAGES_REPOSITORY = 'master-images',
    MASTER_IMAGES_BRANCH = 'master',
}
