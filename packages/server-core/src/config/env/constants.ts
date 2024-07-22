/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum EnvironmentName {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
    TEST = 'test',
}

export enum ConfigDefaults {
    REDIS = 'redis://127.0.0.1',
    RABBITMQ = 'amqp://root:start123@127.0.0.1',
    VAULT = 'start123@http://127.0.0.1:8090/v1/',
    MASTER_IMAGE_URL = 'https://github.com/PrivateAim/master-images/',
    MASTER_IMAGE_OWNER = 'PrivateAim',
    MASTER_IMAGE_REPOSITORY = 'master-images',
    MASTER_IMAGE_BRANCH = 'master',
}
