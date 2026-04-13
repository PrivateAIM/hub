/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { read, readInt } from 'envix';
import { EnvironmentName } from '@privateaim/kit';
import { EnvironmentInputKey } from './constants.ts';
import type { Environment } from './types.ts';

let instance : Environment | undefined;

export function useEnv() : Environment;
export function useEnv<K extends keyof Environment>(key: K) : Environment[K];
export function useEnv<K extends keyof Environment>(key?: K) : any {
    if (typeof instance !== 'undefined') {
        if (typeof key === 'string') {
            return instance[key];
        }

        return instance;
    }

    instance = {
        env: read(EnvironmentInputKey.ENV, EnvironmentName.DEVELOPMENT) as `${EnvironmentName}`,
        port: readInt(EnvironmentInputKey.PORT, 3000),
        publicURL: read(EnvironmentInputKey.PUBLIC_URL, 'http://localhost:3000'),

        clientId: read(EnvironmentInputKey.CLIENT_ID, 'system'),
        clientSecret: read(EnvironmentInputKey.CLIENT_SECRET, 'start123'),

        realm: read(EnvironmentInputKey.REALM, 'master'),

        rabbitMqConnectionString: read(EnvironmentInputKey.RABBITMQ_CONNECTION_STRING),
        redisConnectionString: read(EnvironmentInputKey.REDIS_CONNECTION_STRING),
        authupURL: read(EnvironmentInputKey.AUTHUP_URL),
    };

    if (typeof key === 'string') {
        return instance[key];
    }

    return instance;
}
