/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import {
    readBoolFromProcessEnv,
    readBoolOrStringFromProcessEnv,
    readFromProcessEnv,
    readIntFromProcessEnv
} from '@privateaim/flame-server-kit';
import { config } from 'dotenv';
import type { EnvironmentName } from './constants';
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

    instance = {
        env: readFromProcessEnv('NODE_ENV', 'development') as `${EnvironmentName}`,
        port: readIntFromProcessEnv('PORT', 3002),

        jwtMaxAge: readIntFromProcessEnv('JWT_MAX_AGE', 3600),

        minioConnectionString: readBoolOrStringFromProcessEnv('MINIO_CONNECTION_STRING'),
        redisConnectionString: readBoolOrStringFromProcessEnv('REDIS_CONNECTION_STRING'),
        rabbitMqConnectionString: readBoolOrStringFromProcessEnv('RABBITMQ_CONNECTION_STRING'),
        vaultConnectionString: readBoolOrStringFromProcessEnv('VAULT_CONNECTION_STRING'),

        apiUrl: readFromProcessEnv('API_URL', 'http://127.0.0.1:3002/'),
        authupApiUrl: readFromProcessEnv('AUTHUP_API_URL', 'http://127.0.0.1:3010/'),
        appUrl: readFromProcessEnv('APP_URL', 'http://127.0.0.1:3000/'),

        skipProposalApprovalOperation: readBoolFromProcessEnv('SKIP_PROPOSAL_APPROVAL_OPERATION', false),
        skipTrainApprovalOperation: readBoolFromProcessEnv('SKIP_TRAIN_APPROVAL_OPERATION', false),

        httpProxyAPIs: readFromProcessEnv('HTTP_PROXY_APIS', null),
    };

    if (typeof key === 'string') {
        return instance[key];
    }

    return instance;
}
