/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenCreator } from '@authup/core-http-kit';
import {
    type ITokenVerifierCache,
    MemoryTokenVerifierCache,
    RedisTokenVerifierCache,
    TokenVerifier,
} from '@authup/server-adapter-kit';
import type { Client as RedisClient } from 'redis-extension';

type AuthTokenVerifierCreateContext = {
    baseURL?: string,
    creator: TokenCreator,
    redisClient?: RedisClient,
};

export function createAuthupTokenVerifier(ctx: AuthTokenVerifierCreateContext) {
    let cache : ITokenVerifierCache;
    if (ctx.redisClient) {
        cache = new RedisTokenVerifierCache(ctx.redisClient);
    } else {
        cache = new MemoryTokenVerifierCache();
    }

    return new TokenVerifier({
        baseURL: ctx.baseURL,
        creator: ctx.creator,
        cache,
    });
}
