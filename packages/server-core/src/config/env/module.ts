/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import {
    oneOf,
    read,
    readBool,
    readInt,
} from 'envix';
import { config } from 'dotenv';
import { ConfigDefaults, EnvironmentInputKey, EnvironmentName } from './constants';
import type { Environment } from './type';

config({
    debug: false,
    path: path.resolve(__dirname, '..', '..', '..', '.env'),
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

        redisConnectionString: oneOf([
            readBool(EnvironmentInputKey.REDIS_CONNECTION_STRING),
            read(EnvironmentInputKey.REDIS_CONNECTION_STRING),
        ]),
        rabbitMqConnectionString: oneOf([
            readBool('RABBITMQ_CONNECTION_STRING'),
            read('RABBITMQ_CONNECTION_STRING')]),
        vaultConnectionString: oneOf([
            readBool(EnvironmentInputKey.VAULT_CONNECTION_STRING),
            read(EnvironmentInputKey.VAULT_CONNECTION_STRING),
        ]),
        harborURL: read(EnvironmentInputKey.HARBOR_URL),
        lokiURL: read(EnvironmentInputKey.LOKI_URL),
        lokiCompactorURL: read(EnvironmentInputKey.LOKI_COMPACTOR_URL),
        lokiQuerierURL: read(EnvironmentInputKey.LOKI_QUERIER_URL),
        authupURL: read(EnvironmentInputKey.AUTHUP_URL),

        publicURL: read(EnvironmentInputKey.PUBLIC_URL, `http://127.0.0.1:${port}/`),

        masterImagesOwner: read(EnvironmentInputKey.MASTER_IMAGES_OWNER, ConfigDefaults.MASTER_IMAGES_OWNER),
        masterImagesRepository: read(EnvironmentInputKey.MASTER_IMAGES_REPOSITORY, ConfigDefaults.MASTER_IMAGES_REPOSITORY),
        masterImagesBranch: read(EnvironmentInputKey.MASTER_IMAGES_BRANCH, ConfigDefaults.MASTER_IMAGES_BRANCH),

        skipProjectApproval: readBool(EnvironmentInputKey.SKIP_PROJECT_APPROVAL),
        skipAnalysisApproval: readBool(EnvironmentInputKey.SKIP_ANALYSIS_APPROVAL),
    };

    if (typeof key === 'string') {
        return instance[key];
    }

    return instance;
}
