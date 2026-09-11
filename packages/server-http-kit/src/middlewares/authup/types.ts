/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenVerifier } from '@authup/server-adapter-kit';
import type { Client as RedisClient } from 'redis-extension';
import type { Client as AuthupClient } from '@authup/core-http-kit';

export type AuthorizationMiddlewareRegistrationOptions = {
    authupClient?: AuthupClient,
    redisClient?: RedisClient,
    tokenVerifier?: TokenVerifier,

    dryRun?: boolean,

    /**
     * Namespace prefixed onto the cookie-fallback token lookup
     * (`access_token` -> `<cookiePrefix>access_token`), mirroring
     * `@authup/client-web-nuxt`'s `cookiePrefix` module option. Must match
     * the value the UI was deployed with — set whenever `NUXT_PUBLIC_COOKIE_DOMAIN`
     * is widened to share the session cookie with this service, so Authup's
     * own hosted pages can't collide with it. Empty (no prefix) by default.
     */
    cookiePrefix?: string,
};
