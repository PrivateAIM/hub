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
import { TokenVerifier } from '@authup/server-adapter-kit';
import { isJWTError } from '@authup/specs';
import { HubError } from '@privateaim/errors';
import { assertIntrospectableToken } from '@privateaim/server-kit';
import { isClientError } from 'hapic';
import type { AuthCapabilityTokenVerifierCreateContext } from './types.ts';
import { UnconfiguredTokenVerifier } from './unconfigured-token-verifier.ts';

/**
 * Verifies capability tokens locally: signature against Authup's `/jwks`,
 * `aud`, `kind: capability_token` and `exp` (authup's `TokenVerifier` with
 * `capability`). A key-fetch failure answers 502, not 401. The compact-JWS guard runs first, so a credential that
 * cannot be a token never triggers a key fetch.
 */
export class CapabilityTokenVerifier extends TokenVerifier {
    override async verify(token: string, options?: TokenVerifyOptions): Promise<TokenVerificationData> {
        assertIntrospectableToken(token);

        try {
            return await super.verify(token, options);
        } catch (e) {
            // An unreachable /jwks says nothing about the token: 502, not a 401.
            // authup unwraps the key loader's JWTError (cause: the failed
            // request) from vouchly's key_unavailable; an unknown key (404)
            // carries no cause and stays a 401.
            if (isJWTError(e) && isClientError(e.cause)) {
                throw new HubError({
                    code: 'upstream_error',
                    status: 502,
                    message: e.message,
                    cause: e,
                });
            }

            throw e;
        }
    }
}

export function createAuthupCapabilityTokenVerifier(ctx: AuthCapabilityTokenVerifierCreateContext): ITokenVerifier {
    if (!ctx.baseURL) {
        return new UnconfiguredTokenVerifier();
    }

    return new CapabilityTokenVerifier({
        baseURL: ctx.baseURL,
        capability: { audience: ctx.audience },
        cache: ctx.cache,
    });
}
