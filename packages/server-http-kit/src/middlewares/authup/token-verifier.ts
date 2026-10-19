/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ITokenCache,
    ITokenVerifier,
    TokenVerificationData,
    TokenVerifyOptions,
} from '@authup/server-adapter-kit';
import {
    MemoryTokenCache,
    RedisTokenCache,
    TokenVerifier,
} from '@authup/server-adapter-kit';
import { assertIntrospectableToken } from '@privateaim/server-kit';
import type { AuthTokenVerifierCreateContext } from './types.ts';
import { UnconfiguredTokenVerifier } from './unconfigured-token-verifier.ts';

/**
 * Refuses a credential that is not structurally a token before it reaches
 * introspection — see `isIntrospectableToken` for the credential confusion
 * this closes (authup#3724: an Authup server <= 1.0.0-beta.69 reported a
 * malformed token as the calling service's own client, and the beta.70
 * verifier still forwards such a token to introspection). Lives on the
 * verifier every service builds, so every credential source — header, cookie
 * fallback, socket handshake — is covered from one place.
 *
 * Every hub service passes a `creator`, so the verifier runs in REMOTE mode
 * (introspection), and always passes a result cache: Redis when the service
 * has one, else process memory. Entries live until the token's `exp` and are
 * namespaced per introspecting client (`buildAuthupTokenCacheNamespace`):
 * authup answers `active: false` to a caller that may not introspect a token,
 * so a result is only valid for the client that asked. Services sharing one
 * Redis, one Authup URL and one client still share entries.
 */
export class IntrospectableTokenVerifier extends TokenVerifier {
    override async verify(token: string, options?: TokenVerifyOptions): Promise<TokenVerificationData> {
        assertIntrospectableToken(token);
        return super.verify(token, options);
    }
}

/**
 * The result-cache namespace of a verifier introspecting as `ctx.clientId`
 * (in `ctx.realm`): authup's default (`authup:remote:<baseURL>`) plus the
 * client, so verifiers of different clients never share entries. Without a
 * client id, `undefined` keeps authup's default.
 */
export function buildAuthupTokenCacheNamespace(
    ctx: Pick<AuthTokenVerifierCreateContext, 'baseURL' | 'clientId' | 'realm'>,
): string | undefined {
    if (!ctx.clientId) {
        return undefined;
    }

    return `authup:remote:${ctx.baseURL}:client:${ctx.realm ?? ''}:${ctx.clientId}`;
}

export function createAuthupTokenVerifier(ctx: AuthTokenVerifierCreateContext): ITokenVerifier {
    if (!ctx.baseURL) {
        return new UnconfiguredTokenVerifier();
    }

    let cache : ITokenCache;
    if (ctx.redisClient) {
        cache = new RedisTokenCache(ctx.redisClient);
    } else {
        cache = new MemoryTokenCache();
    }

    return new IntrospectableTokenVerifier({
        baseURL: ctx.baseURL,
        creator: ctx.creator,
        cache,
        cacheNamespace: buildAuthupTokenCacheNamespace(ctx),
    });
}
