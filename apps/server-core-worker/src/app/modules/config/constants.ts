/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TypedToken } from 'eldin';
import { ConfigInjectionKey as BaseConfigInjectionKey } from '@privateaim/server-kit';
import type { Config } from './types.ts';

export const ConfigInjectionKey = BaseConfigInjectionKey as unknown as TypedToken<Config>;

export const ConfigDefaults = {
    PORT: 3000,

    REALM: 'master',

    CLIENT_ID: 'system',
    CLIENT_SECRET: 'start123',

    RABBITMQ: 'amqp://root:start123@127.0.0.1',
} as const;

export enum EnvironmentInputKey {
    ENV = 'NODE_ENV',
    PORT = 'PORT',

    CLIENT_ID = 'CLIENT_ID',
    CLIENT_SECRET = 'CLIENT_SECRET',

    REALM = 'REALM',

    RABBITMQ_CONNECTION_STRING = 'RABBITMQ_CONNECTION_STRING',

    CORE_URL = 'CORE_URL',
    AUTHUP_URL = 'AUTHUP_URL',
    STORAGE_URL = 'STORAGE_URL',
}
