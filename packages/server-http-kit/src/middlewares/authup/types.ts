/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ITokenCache, ITokenVerifier } from '@authup/server-adapter-kit';
import type { Client as RedisClient } from 'redis-extension';
import type { Client as AuthupClient } from '@authup/core-http-kit';

export type AuthTokenVerifierClientContext = {
    id: string,
    secret: string,
    /**
     * The realm the client belongs to.
     */
    realm: string,
};

export type AuthTokenVerifierCreateContext = {
    /**
     * The Authup URL. Without it the verifier refuses every token.
     */
    baseURL?: string,
    /**
     * The Authup client the verifier introspects as. It mints the
     * introspection token (client credentials) and names the result-cache
     * namespace, so a verifier never serves a result cached for another
     * client.
     */
    client: AuthTokenVerifierClientContext,
    /**
     * The result cache. Defaults to Redis when `redisClient` is set, else
     * process memory.
     */
    cache?: ITokenCache,
    redisClient?: RedisClient,
};

export type AuthCapabilityTokenVerifierCreateContext = {
    /**
     * The Authup URL (its `/jwks` verifies the signature). Without it the
     * verifier refuses every token.
     */
    baseURL?: string,
    /**
     * The `aud` a capability token must name to be accepted here.
     */
    audience: string,
    cache?: ITokenCache,
};

export type AuthorizationMiddlewareCapabilityOptions = {
    /**
     * Build it with `createAuthupCapabilityTokenVerifier`. It verifies a
     * bearer whose payload names `kind: capability_token`, and the query
     * token.
     */
    verifier: ITokenVerifier,
    /**
     * The query parameter carrying a short-lived (`exp - iat <= 60`)
     * capability token. Default: `dt`.
     */
    queryParameter?: string,
};

export type AuthorizationMiddlewareRegistrationOptions = {
    /**
     * Set, capability tokens are accepted beside access tokens: from the
     * `Authorization` header, then from the query parameter. A capability
     * request gets `capability`, never an identity or a permission evaluator.
     * Unset, a capability token is verified like an access token, which
     * refuses it, and the query parameter is ignored.
     */
    capability?: AuthorizationMiddlewareCapabilityOptions,
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
