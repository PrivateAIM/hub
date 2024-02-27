/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { read } from 'envix';
import { hasOwnProperty } from '@privateaim/core';
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
        env: read('NODE_ENV', 'development') as `${EnvironmentName}`,

        redisConnectionString: read('REDIS_CONNECTION_STRING', null),
        rabbitMqConnectionString: read('RABBITMQ_CONNECTION_STRING', 'amqp://root:start123@127.0.0.1'),
        vaultConnectionString: read('VAULT_CONNECTION_STRING', 'start123@http://127.0.0.1:8090/v1/'),

        apiUrl: read('API_URL', 'http://127.0.0.1:3002/'),
        authupApiUrl: read('AUTHUP_API_URL', 'http://127.0.0.1:3010/'),
        storageURL: read('STORAGE_URL'),
    };

    if (typeof key === 'string') {
        return instance[key];
    }

    return instance;
}

export function isSetEnv(key: keyof Environment) : boolean {
    const env = useEnv();

    return hasOwnProperty(env, key) && typeof env[key] !== 'undefined' && env[key] !== null;
}
