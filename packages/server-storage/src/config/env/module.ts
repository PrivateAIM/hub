/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { read, readInt } from 'envix';
import type { EnvironmentName } from '@privateaim/server-kit';
import type { Environment } from './types.ts';

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
        minioConnectionString: read('MINIO_CONNECTION_STRING', 'http://admin:start123@127.0.0.1:9000'),
        vaultConnectionString: read('VAULT_CONNECTION_STRING'),

        authupURL: read('AUTHUP_URL'),
    };

    if (typeof key === 'string') {
        return instance[key];
    }

    return instance;
}
