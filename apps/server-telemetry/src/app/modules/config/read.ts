/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/server-kit';
import { read, readInt } from 'envix';
import { ConfigDefaults, EnvironmentInputKey } from './constants.ts';
import type { Config } from './types.ts';

export function readConfigFromEnv(): Partial<Config> {
    return {
        env: read(EnvironmentInputKey.ENV, EnvironmentName.DEVELOPMENT) as `${EnvironmentName}`,
        port: readInt(EnvironmentInputKey.PORT, ConfigDefaults.PORT),
        publicURL: read(EnvironmentInputKey.PUBLIC_URL, ConfigDefaults.PUBLIC_URL),

        clientId: read(EnvironmentInputKey.CLIENT_ID, ConfigDefaults.CLIENT_ID),
        clientSecret: read(EnvironmentInputKey.CLIENT_SECRET, ConfigDefaults.CLIENT_SECRET),

        realm: read(EnvironmentInputKey.REALM, ConfigDefaults.REALM),

        rabbitMqConnectionString: read(EnvironmentInputKey.RABBITMQ_CONNECTION_STRING),
        redisConnectionString: read(EnvironmentInputKey.REDIS_CONNECTION_STRING),
        authupURL: read(EnvironmentInputKey.AUTHUP_URL),

        victoriaLogsURL: read(EnvironmentInputKey.VICTORIA_LOGS_URL),
        victoriaLogsIngestorURL: read(EnvironmentInputKey.VICTORIA_LOGS_INGESTOR_URL),
        victoriaLogsQuerierURL: read(EnvironmentInputKey.VICTORIA_LOGS_QUERIER_URL),
    };
}
