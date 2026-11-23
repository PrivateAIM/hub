/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EnvironmentName } from '../constants';

/**
 * Which `X-Forwarded-For` hops a service trusts when it derives the client
 * address (audit trail, rate-limit key): every hop (`true`, the default),
 * none (`false`), a hop count, or an allowlist of IPs / CIDRs / presets.
 */
export type TrustProxy = boolean | number | string[];

export type BaseServerConfig = {
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

    /**
     * `TRUST_PROXY`, canonicalized (see `canonicalizeTrustProxy`).
     */
    trustProxy?: TrustProxy;

    /**
     * Seconds the listener keeps serving after SIGTERM / SIGINT while
     * `GET /readyz` already answers 503, so a load balancer stops routing
     * to the process before it closes (`SHUTDOWN_DELAY`, default 0).
     */
    shutdownDelay?: number;
};
