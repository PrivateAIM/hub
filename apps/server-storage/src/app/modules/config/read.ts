/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName, canonicalizeTrustProxy } from '@privateaim/server-kit';
import { read, readInt } from 'envix';
import { ConfigDefaults, EnvironmentInputKey } from './constants.ts';
import type { TrustProxy } from '@privateaim/server-kit';
import type { Config } from './types.ts';

export function readConfigFromEnv(): Partial<Config> {
    return {
        env: read(EnvironmentInputKey.ENV, { default: EnvironmentName.DEVELOPMENT }) as `${EnvironmentName}`,
        port: readInt(EnvironmentInputKey.PORT, { default: ConfigDefaults.PORT }),
        publicURL: read(EnvironmentInputKey.PUBLIC_URL, { default: ConfigDefaults.PUBLIC_URL }),

        clientId: read(EnvironmentInputKey.CLIENT_ID, { default: ConfigDefaults.CLIENT_ID }),
        clientSecret: read(EnvironmentInputKey.CLIENT_SECRET, { default: ConfigDefaults.CLIENT_SECRET }),
        capabilityClientId: read(EnvironmentInputKey.CAPABILITY_CLIENT_ID),

        realm: read(EnvironmentInputKey.REALM, { default: ConfigDefaults.REALM }),

        rabbitMqConnectionString: read(EnvironmentInputKey.RABBITMQ_CONNECTION_STRING),
        redisConnectionString: read(EnvironmentInputKey.REDIS_CONNECTION_STRING),
        minioConnectionString: read(EnvironmentInputKey.MINIO_CONNECTION_STRING),
        storagePath: read(EnvironmentInputKey.STORAGE_PATH),

        authupURL: read(EnvironmentInputKey.AUTHUP_URL),

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
