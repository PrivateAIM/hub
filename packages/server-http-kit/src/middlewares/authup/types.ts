/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ITokenVerifier } from '@authup/server-adapter-kit';
import type { Client as RedisClient } from 'redis-extension';
import type { Client as AuthupClient, TokenCreator } from '@authup/core-http-kit';

export type AuthTokenVerifierCreateContext = {
    baseURL?: string,
    creator: TokenCreator,
    redisClient?: RedisClient,
};

export type AuthorizationMiddlewareRegistrationOptions = {
    /**
     * Required to authenticate anything: without it the middleware attaches
     * no identity, so every `ForceLoggedInMiddleware` route answers 401.
     */
    authupClient?: AuthupClient,
    redisClient?: RedisClient,
    /**
     * Build it with `createAuthupTokenVerifier`, which refuses malformed
     * tokens before introspection.
     */
    tokenVerifier: ITokenVerifier,


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
