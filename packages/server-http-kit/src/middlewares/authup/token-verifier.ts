/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ITokenVerifierCache,
    TokenVerificationData,
    TokenVerifyOptions,
} from '@authup/server-adapter-kit';
import {
    MemoryTokenVerifierCache,
    RedisTokenVerifierCache,
    TokenVerifier,
} from '@authup/server-adapter-kit';
import { assertIntrospectableToken } from '@privateaim/server-kit';
import type { AuthTokenVerifierCreateContext } from './types.ts';

/**
 * Refuses a credential that is not structurally a token before it reaches
 * introspection — see `isIntrospectableToken` for the credential confusion
 * this closes (authup#3724: a malformed token was reported as the calling
 * service's own client). Lives on the verifier every service builds, so every
 * credential source — header, cookie fallback, socket handshake — is covered
 * from one place.
 */
export class IntrospectableTokenVerifier extends TokenVerifier {
    override async verify(token: string, options?: TokenVerifyOptions): Promise<TokenVerificationData> {
        assertIntrospectableToken(token);
        return super.verify(token, options);
    }
}

export function createAuthupTokenVerifier(ctx: AuthTokenVerifierCreateContext): IntrospectableTokenVerifier {
    let cache : ITokenVerifierCache;
    if (ctx.redisClient) {
        cache = new RedisTokenVerifierCache(ctx.redisClient);
    } else {
        cache = new MemoryTokenVerifierCache();
    }

    return new IntrospectableTokenVerifier({
        baseURL: ctx.baseURL,
        creator: ctx.creator,
        cache,
    });
}
