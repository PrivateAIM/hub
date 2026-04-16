/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { orFail, read, readInt } from 'envix';
import { config } from 'dotenv';
import { EnvironmentName } from '@privateaim/server-kit';
import type { Environment } from './type';

config({
    debug: false,
    quiet: true,
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
        env: read('NODE_ENV', EnvironmentName.DEVELOPMENT) as `${EnvironmentName}`,
        port: readInt('PORT', 3000),

        clientId: read('CLIENT_ID', 'system'),
        clientSecret: read('CLIENT_SECRET', 'start123'),

        realm: read('REALM', 'master'),

        rabbitMqConnectionString: read('RABBITMQ_CONNECTION_STRING', 'amqp://root:start123@127.0.0.1'),

        coreURL: orFail(read('CORE_URL')),
        authupURL: orFail(read('AUTHUP_URL')),
        storageURL: orFail(read('STORAGE_URL')),
    };

    if (typeof key === 'string') {
        return instance[key];
    }

    return instance;
}
