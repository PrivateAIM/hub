/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { orFail, read, readInt } from 'envix';
import { EnvironmentName } from '@privateaim/server-kit';
import { EnvironmentInputKey } from './constants.ts';
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
        env: read(EnvironmentInputKey.ENV, EnvironmentName.DEVELOPMENT) as `${EnvironmentName}`,
        port: readInt(EnvironmentInputKey.PORT, 3000),

        clientId: read(EnvironmentInputKey.CLIENT_ID, 'system'),
        clientSecret: read(EnvironmentInputKey.CLIENT_SECRET, 'start123'),

        realm: read(EnvironmentInputKey.REALM, 'master'),

        rabbitMqConnectionString: read(EnvironmentInputKey.RABBITMQ_CONNECTION_STRING, 'amqp://root:start123@127.0.0.1'),

        coreURL: orFail(read(EnvironmentInputKey.CORE_URL)),
        authupURL: orFail(read(EnvironmentInputKey.AUTHUP_URL)),
        storageURL: orFail(read(EnvironmentInputKey.STORAGE_URL)),
    };

    if (typeof key === 'string') {
        return instance[key];
    }

    return instance;
}
