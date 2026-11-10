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
import { assertIntrospectableToken } from '@privateaim/server-kit';
import type { AuthCapabilityTokenVerifierCreateContext } from './types.ts';
import { UnconfiguredTokenVerifier } from './unconfigured-token-verifier.ts';

/**
 * Verifies capability tokens locally: signature against Authup's `/jwks`,
 * `aud`, `kind: capability_token` and `exp` (authup's `TokenVerifier` with
 * `capability`). The compact-JWS guard runs first, so a credential that
 * cannot be a token never triggers a key fetch.
 */
export class CapabilityTokenVerifier extends TokenVerifier {
    override async verify(token: string, options?: TokenVerifyOptions): Promise<TokenVerificationData> {
        assertIntrospectableToken(token);

        return super.verify(token, options);
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
