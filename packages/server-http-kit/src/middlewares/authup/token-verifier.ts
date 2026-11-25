/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ITokenVerifier,
    TokenVerificationData,
    TokenVerifyOptions,
} from '@authup/server-adapter-kit';
import { MemoryTokenCache, TokenVerifier } from '@authup/server-adapter-kit';
import { assertIntrospectableToken, createAuthupClientTokenCreator } from '@privateaim/server-kit';
import type { AuthTokenVerifierClientContext, AuthTokenVerifierCreateContext } from './types.ts';
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
 * The verifier introspects as the given client (REMOTE mode, client
 * credentials) and always has a result cache: the given one (see
 * `createAuthupTokenCache`), else process memory. Entries live until the
 * token's `exp` and are namespaced per introspecting client
 * (`buildCacheNamespace`):
 * authup answers `active: false` to a caller that may not introspect a token,
 * so a result is only valid for the client that asked. Services sharing one
 * Redis, one Authup URL and one client still share entries.
 */
export class IntrospectableTokenVerifier extends TokenVerifier {
    override async verify(token: string, options?: TokenVerifyOptions): Promise<TokenVerificationData> {
        assertIntrospectableToken(token);

        // authup answers a failed introspection request (unreachable, 5xx,
        // 429, a refused service credential or token mint) with an
        // UpstreamError (502), a timeout with an UpstreamTimeoutError (504).
        return super.verify(token, options);
    }
}

/**
 * The result-cache namespace of a verifier introspecting as `client`:
 * authup's default (`authup:remote:<baseURL>`) plus the client and its realm,
 * so verifiers of different clients never share entries. Services sharing a
 * Redis share entries only through an identical string, so it must stay
 * byte-stable.
 */
function buildCacheNamespace(baseURL: string, client: AuthTokenVerifierClientContext): string {
    return `authup:remote:${baseURL}:client:${client.realm}:${client.id}`;
}

export function createAuthupTokenVerifier(ctx: AuthTokenVerifierCreateContext): ITokenVerifier {
    if (!ctx.baseURL) {
        return new UnconfiguredTokenVerifier();
    }

    return new IntrospectableTokenVerifier({
        baseURL: ctx.baseURL,
        // The creator and the namespace come from the one `client`, so the
        // namespace always names the client that introspects.
        creator: createAuthupClientTokenCreator({
            baseURL: ctx.baseURL,
            clientId: ctx.client.id,
            clientSecret: ctx.client.secret,
            realm: ctx.client.realm,
        }),
        cache: ctx.cache ?? new MemoryTokenCache(),
        cacheNamespace: buildCacheNamespace(ctx.baseURL, ctx.client),
    });
}
