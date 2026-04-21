/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isBoolTrue } from '@privateaim/kit';
import { EnvironmentName } from '@privateaim/server-kit';
import {
    oneOf,
    read,
    readBool,
    readInt,
} from 'envix';
import { ConfigDefaults, EnvironmentInputKey } from './constants.ts';
import type { Config } from './types.ts';

export function readConfigFromEnv(): Partial<Config> {
    const port = readInt(EnvironmentInputKey.PORT, ConfigDefaults.PORT);

    const config: Partial<Config> = {
        env: read(EnvironmentInputKey.ENV, EnvironmentName.DEVELOPMENT) as `${EnvironmentName}`,
        port,

        realm: read(EnvironmentInputKey.REALM, ConfigDefaults.REALM),

        clientId: read(EnvironmentInputKey.CLIENT_ID, ConfigDefaults.CLIENT_ID),
        clientSecret: read(EnvironmentInputKey.CLIENT_SECRET, ConfigDefaults.CLIENT_SECRET),

        harborURL: read(EnvironmentInputKey.HARBOR_URL),

        authupURL: read(EnvironmentInputKey.AUTHUP_URL),
        telemetryURL: read(EnvironmentInputKey.TELEMETRY_URL),
        publicURL: read(EnvironmentInputKey.PUBLIC_URL, `http://127.0.0.1:${port}/`),

        masterImagesOwner: read(EnvironmentInputKey.MASTER_IMAGES_OWNER, ConfigDefaults.MASTER_IMAGES_OWNER),
        masterImagesRepository: read(EnvironmentInputKey.MASTER_IMAGES_REPOSITORY, ConfigDefaults.MASTER_IMAGES_REPOSITORY),
        masterImagesBranch: read(EnvironmentInputKey.MASTER_IMAGES_BRANCH, ConfigDefaults.MASTER_IMAGES_BRANCH),

        skipProjectApproval: readBool(EnvironmentInputKey.SKIP_PROJECT_APPROVAL),
        skipAnalysisApproval: readBool(EnvironmentInputKey.SKIP_ANALYSIS_APPROVAL),
    };

    // RabbitMQ
    const rabbitMqConnectionString = oneOf([
        readBool(EnvironmentInputKey.RABBITMQ_CONNECTION_STRING),
        read(EnvironmentInputKey.RABBITMQ_CONNECTION_STRING),
    ]);

    if (typeof rabbitMqConnectionString === 'string') {
        config.rabbitMqConnectionString = rabbitMqConnectionString;
    } else if (isBoolTrue(rabbitMqConnectionString)) {
        config.rabbitMqConnectionString = ConfigDefaults.RABBITMQ;
    }

    // Redis
    const redisConnectionString = oneOf([
        readBool(EnvironmentInputKey.REDIS_CONNECTION_STRING),
        read(EnvironmentInputKey.REDIS_CONNECTION_STRING),
    ]);

    if (typeof redisConnectionString === 'string') {
        config.redisConnectionString = redisConnectionString;
    } else if (isBoolTrue(redisConnectionString)) {
        config.redisConnectionString = ConfigDefaults.REDIS;
    }

    // Vault
    const vaultConnectionString = oneOf([
        readBool(EnvironmentInputKey.VAULT_CONNECTION_STRING),
        read(EnvironmentInputKey.VAULT_CONNECTION_STRING),
    ]);

    if (typeof vaultConnectionString === 'string') {
        config.vaultConnectionString = vaultConnectionString;
    } else if (isBoolTrue(vaultConnectionString)) {
        config.vaultConnectionString = ConfigDefaults.VAULT;
    }

    return config;
}
