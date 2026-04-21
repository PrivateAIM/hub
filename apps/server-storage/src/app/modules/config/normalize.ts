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

        publicURL: input.publicURL ?? `http://localhost:${input.port ?? ConfigDefaults.PORT}`,

        authupURL: input.authupURL,
        redisConnectionString: input.redisConnectionString,
        rabbitMqConnectionString: input.rabbitMqConnectionString,

        minioConnectionString: input.minioConnectionString ?? ConfigDefaults.MINIO_CONNECTION_STRING,
    };
}
