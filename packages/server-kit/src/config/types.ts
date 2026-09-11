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

    /**
     * Namespace prefixed onto the authup middleware's cookie-fallback token
     * lookup — must match the `cookiePrefix` a sibling client-ui deployment
     * was configured with. See
     * `packages/server-http-kit/src/middlewares/authup/types.ts`.
     */
    cookiePrefix?: string;
}
