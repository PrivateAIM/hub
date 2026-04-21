/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/server-kit';
import { ConfigDefaults } from './constants.ts';
import type { Config } from './types.ts';

export function normalizeConfig(input: Partial<Config>): Config {
    return {
        env: input.env ?? EnvironmentName.DEVELOPMENT,
        port: input.port ?? ConfigDefaults.PORT,

        realm: input.realm ?? ConfigDefaults.REALM,

        clientId: input.clientId ?? ConfigDefaults.CLIENT_ID,
        clientSecret: input.clientSecret ?? ConfigDefaults.CLIENT_SECRET,

        authupURL: input.authupURL ?? ConfigDefaults.AUTHUP_URL,
        redisConnectionString: input.redisConnectionString ?? ConfigDefaults.REDIS_CONNECTION_STRING,
        rabbitMqConnectionString: input.rabbitMqConnectionString,
    };
}
