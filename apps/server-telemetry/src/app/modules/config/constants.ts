/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { Environment } from './types.ts';

export const ConfigInjectionKey = new TypedToken<Environment>('Config');

export enum EnvironmentInputKey {
    ENV = 'NODE_ENV',
    PORT = 'PORT',

    CLIENT_ID = 'CLIENT_ID',
    CLIENT_SECRET = 'CLIENT_SECRET',

    REALM = 'REALM',

    RABBITMQ_CONNECTION_STRING = 'RABBITMQ_CONNECTION_STRING',
    REDIS_CONNECTION_STRING = 'REDIS_CONNECTION_STRING',

    VICTORIA_LOGS_URL = 'VICTORIA_LOGS_URL',
    VICTORIA_LOGS_INGESTOR_URL = 'VICTORIA_LOGS_INGESTOR_URL',
    VICTORIA_LOGS_QUERIER_URL = 'VICTORIA_LOGS_QUERIER_URL',

    AUTHUP_URL = 'AUTHUP_URL',

    PUBLIC_URL = 'PUBLIC_URL',
}
