/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName, canonicalizeTrustProxy } from '@privateaim/server-kit';
import {
    orFail,
    read,
    readInt,
} from 'envix';
import { ConfigDefaults, EnvironmentInputKey } from './constants.ts';
import type { TrustProxy } from '@privateaim/server-kit';
import type { Config } from './types.ts';

export function readConfigFromEnv(): Partial<Config> {
    return {
        env: read(EnvironmentInputKey.ENV, EnvironmentName.DEVELOPMENT) as `${EnvironmentName}`,
        port: readInt(EnvironmentInputKey.PORT, ConfigDefaults.PORT),

        clientId: read(EnvironmentInputKey.CLIENT_ID, ConfigDefaults.CLIENT_ID),
        clientSecret: read(EnvironmentInputKey.CLIENT_SECRET, ConfigDefaults.CLIENT_SECRET),

        realm: read(EnvironmentInputKey.REALM, ConfigDefaults.REALM),

        rabbitMqConnectionString: read(EnvironmentInputKey.RABBITMQ_CONNECTION_STRING),
        redisConnectionString: orFail(read(EnvironmentInputKey.REDIS_CONNECTION_STRING)),
        authupURL: read(EnvironmentInputKey.AUTHUP_URL, ConfigDefaults.AUTHUP_URL),

        cookiePrefix: read(EnvironmentInputKey.COOKIE_PREFIX),
        trustProxy: readTrustProxy(EnvironmentInputKey.TRUST_PROXY),
        shutdownDelay: readInt(EnvironmentInputKey.SHUTDOWN_DELAY),
    };
}

function readTrustProxy(key: string): TrustProxy | undefined {
    const raw = read(key);

    if (typeof raw !== 'string' || raw.trim().length === 0) {
        return undefined;
    }

    return canonicalizeTrustProxy(raw);
}
