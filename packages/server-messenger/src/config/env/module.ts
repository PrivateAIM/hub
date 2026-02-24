/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    orFail, read, readInt,
} from 'envix';
import { EnvironmentName } from '@privateaim/server-kit';
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
        env: read('NODE_ENV', EnvironmentName.DEVELOPMENT) as `${EnvironmentName}`,
        port: readInt('PORT', 3000),

        rabbitMqConnectionString: read('RABBITMQ_CONNECTION_STRING'),
        redisConnectionString: orFail(read('REDIS_CONNECTION_STRING')),
        vaultConnectionString: read('VAULT_CONNECTION_STRING'),
        authupURL: read('AUTHUP_URL', 'http://127.0.0.1:3010/'),
    };

    if (typeof key === 'string') {
        return instance[key];
    }

    return instance;
}
