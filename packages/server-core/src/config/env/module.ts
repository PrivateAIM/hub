/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isBoolTrue } from '@privateaim/kit';
import { EnvironmentName } from '@privateaim/server-kit';
import path from 'node:path';
import {
    oneOf,
    read,
    readBool,
    readInt,
} from 'envix';
import { config } from 'dotenv';
import { CODE_PATH } from '../../constants.ts';
import { EnvironmentDefaults, EnvironmentInputKey } from './constants.ts';
import type { Environment } from './types.ts';

config({
    debug: false,
    path: path.resolve(CODE_PATH, '..', '.env'),
});

let instance : Environment | undefined;

export function useEnv() : Environment;
export function useEnv<K extends keyof Environment>(key: K) : Environment[K];
export function useEnv(key?: string) : any {
    if (typeof instance !== 'undefined') {
        if (typeof key === 'string') {
            return instance[key];
        }

        return instance;
    }

    const port = readInt(EnvironmentInputKey.PORT, 3000);
    instance = {
        env: read(EnvironmentInputKey.ENV, EnvironmentName.DEVELOPMENT) as `${EnvironmentName}`,
        port,

        harborURL: read(EnvironmentInputKey.HARBOR_URL),

        authupURL: read(EnvironmentInputKey.AUTHUP_URL),
        telemetryURL: read(EnvironmentInputKey.TELEMETRY_URL),
        publicURL: read(EnvironmentInputKey.PUBLIC_URL, `http://127.0.0.1:${port}/`),

        masterImagesOwner: read(EnvironmentInputKey.MASTER_IMAGES_OWNER, EnvironmentDefaults.MASTER_IMAGES_OWNER),
        masterImagesRepository: read(EnvironmentInputKey.MASTER_IMAGES_REPOSITORY, EnvironmentDefaults.MASTER_IMAGES_REPOSITORY),
        masterImagesBranch: read(EnvironmentInputKey.MASTER_IMAGES_BRANCH, EnvironmentDefaults.MASTER_IMAGES_BRANCH),

        skipProjectApproval: readBool(EnvironmentInputKey.SKIP_PROJECT_APPROVAL),
        skipAnalysisApproval: readBool(EnvironmentInputKey.SKIP_ANALYSIS_APPROVAL),
    };

    // RabbitMQ
    const rabbitMqConnectionString = oneOf([
        readBool(EnvironmentInputKey.RABBITMQ_CONNECTION_STRING),
        read(EnvironmentInputKey.RABBITMQ_CONNECTION_STRING),
    ]);

    if (typeof rabbitMqConnectionString === 'string') {
        instance.rabbitMqConnectionString = rabbitMqConnectionString;
    } else if (isBoolTrue(rabbitMqConnectionString)) {
        instance.rabbitMqConnectionString = EnvironmentDefaults.RABBITMQ;
    }

    // Redis
    const redisConnectionString = oneOf([
        readBool(EnvironmentInputKey.REDIS_CONNECTION_STRING),
        read(EnvironmentInputKey.REDIS_CONNECTION_STRING),
    ]);

    if (typeof redisConnectionString === 'string') {
        instance.redisConnectionString = redisConnectionString;
    } else if (isBoolTrue(redisConnectionString)) {
        instance.redisConnectionString = EnvironmentDefaults.REDIS;
    }

    // Vault
    const vaultConnectionString = oneOf([
        readBool(EnvironmentInputKey.VAULT_CONNECTION_STRING),
        read(EnvironmentInputKey.VAULT_CONNECTION_STRING),
    ]);

    if (typeof vaultConnectionString === 'string') {
        instance.vaultConnectionString = vaultConnectionString;
    } else if (isBoolTrue(redisConnectionString)) {
        instance.vaultConnectionString = EnvironmentDefaults.VAULT;
    }

    if (typeof key === 'string') {
        return instance[key];
    }

    return instance;
}
