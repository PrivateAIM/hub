/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { read, readInt } from 'envix';
import { config } from 'dotenv';
import type { EnvironmentName } from './constants';
import type { Environment } from './types';

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
        port: readInt('PORT', 3000),
        publicURL: read('PUBLIC_URL', 'http://localhost:3000'),

        rabbitMqConnectionString: read('RABBITMQ_CONNECTION_STRING'),
        redisConnectionString: read('REDIS_CONNECTION_STRING'),
        vaultConnectionString: read('VAULT_CONNECTION_STRING'),
        authupURL: read('AUTHUP_URL'),
    };

    if (typeof key === 'string') {
        return instance[key];
    }

    return instance;
}
