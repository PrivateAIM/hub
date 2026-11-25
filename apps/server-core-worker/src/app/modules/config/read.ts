/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/server-kit';
import { orFail, read, readInt } from 'envix';
import { ConfigDefaults, EnvironmentInputKey } from './constants.ts';
import type { Config } from './types.ts';

export function readConfigFromEnv(): Partial<Config> {
    return {
        env: read(EnvironmentInputKey.ENV, { default: EnvironmentName.DEVELOPMENT }) as `${EnvironmentName}`,
        port: readInt(EnvironmentInputKey.PORT, { default: ConfigDefaults.PORT }),

        clientId: read(EnvironmentInputKey.CLIENT_ID, { default: ConfigDefaults.CLIENT_ID }),
        clientSecret: read(EnvironmentInputKey.CLIENT_SECRET, { default: ConfigDefaults.CLIENT_SECRET }),

        realm: read(EnvironmentInputKey.REALM, { default: ConfigDefaults.REALM }),

        rabbitMqConnectionString: read(EnvironmentInputKey.RABBITMQ_CONNECTION_STRING, { default: ConfigDefaults.RABBITMQ }),

        coreURL: orFail(read(EnvironmentInputKey.CORE_URL)),
        authupURL: orFail(read(EnvironmentInputKey.AUTHUP_URL)),
        storageURL: orFail(read(EnvironmentInputKey.STORAGE_URL)),
    };
}
