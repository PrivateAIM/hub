/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EnvironmentName } from '../constants';

export interface BaseServerConfig {
    env: `${EnvironmentName}`;
    port: number;

    realm: string;

    clientId: string;
    clientSecret: string;

    publicURL?: string;
    authupURL?: string;
    redisConnectionString?: string;
    rabbitMqConnectionString?: string;
}
