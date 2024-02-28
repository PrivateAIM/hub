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
import { EnvironmentName } from './constants';
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

    const port = readInt('PORT', 3000);
    instance = {
        env: read('NODE_ENV', EnvironmentName.DEVELOPMENT) as `${EnvironmentName}`,
        port,

        jwtMaxAge: readInt('JWT_MAX_AGE', 3600),

        redisConnectionString: oneOf([
            readBool('REDIS_CONNECTION_STRING'),
            read('REDIS_CONNECTION_STRING'),
        ]),
        rabbitMqConnectionString: oneOf([
            readBool('RABBITMQ_CONNECTION_STRING'),
            read('RABBITMQ_CONNECTION_STRING')]),
        vaultConnectionString: oneOf([
            readBool('VAULT_CONNECTION_STRING'),
            read('VAULT_CONNECTION_STRING'),
        ]),

        publicURL: read('PUBLIC_URL', `http://127.0.0.1:${port}/`),
        authupApiURL: read('AUTHUP_URL'),
        appURL: read('APP_URL', 'http://127.0.0.1:3000/'),

        skipProjectApproval: readBool('SKIP_PROJECT_APPROVAL'),
        skipAnalysisApproval: readBool('SKIP_ANALYSIS_APPROVAL'),
    };

    if (typeof key === 'string') {
        return instance[key];
    }

    return instance;
}
