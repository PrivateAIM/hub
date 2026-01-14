/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenCreatorOptions } from '@authup/core-http-kit';
import type {
    ITokenVerifierCache,
} from '@authup/server-adapter-kit';
import {
    MemoryTokenVerifierCache,
    RedisTokenVerifierCache,
    TokenVerifier,
} from '@authup/server-adapter-kit';
import { createMiddleware } from '@authup/server-adapter-http';
import { useRequestCookie } from '@routup/basic/cookie';
import { parseAuthorizationHeader } from 'hapic';
import type { Router } from 'routup';
import { coreHandler, getRequestHeader } from 'routup';
import type { AuthupMiddlewareRegistrationOptions } from './types';
import { applyTokenVerificationData, createFakeTokenVerificationData } from './utils';

export function mountAuthupMiddleware(
    router: Router,
    options: AuthupMiddlewareRegistrationOptions,
) {
    if (!options.client) {
        const data = createFakeTokenVerificationData();

        router.use(coreHandler((req, res, next) => {
            applyTokenVerificationData(req, data, options.fakeAbilities);
            next();
        }));

        return;
    }

    router.use(coreHandler(async (req, res, next) => {
        const headerRaw = getRequestHeader(req, 'authorization');
        if (typeof headerRaw !== 'string') {
            next();
        }

        const cacheKey = `authorization-header:${headerRaw}`;

        if (options.redisClient) {
            const data = await options.redisClient.get(cacheKey);
            if (data) {
                req.headers.authorization = `Bearer ${data}`;
                next();
                return;
            }
        }

        const header = parseAuthorizationHeader(headerRaw);

        if (header.type === 'Basic') {
            const token = await options.client.token.createWithPassword({
                username: header.username,
                password: header.password,
            });

            req.headers.authorization = `Bearer ${token.access_token}`;
            if (options.redisClient) {
                await options.redisClient.setex(cacheKey, token.expires_in, token.access_token);
            }
        }

        next();
    }));

    let tokenCreator : TokenCreatorOptions;
    if (options.vaultClient) {
        tokenCreator = {
            type: 'robotInVault',
            name: 'system',
            vault: options.vaultClient,
            baseURL: options.client.getBaseURL(),
        };
    } else {
        tokenCreator = {
            type: 'user',
            name: 'admin',
            password: 'start123',
            baseURL: options.client.getBaseURL(),
        };
    }

    let cache : ITokenVerifierCache;
    if (options.redisClient) {
        cache = new RedisTokenVerifierCache(options.redisClient);
    } else {
        cache = new MemoryTokenVerifierCache();
    }

    const middleware = createMiddleware({
        tokenByCookie: (req, cookieName) => useRequestCookie(req, cookieName),
        tokenVerifier: new TokenVerifier({
            baseURL: options.client.getBaseURL(),
            creator: tokenCreator,
            cache,
        }),
        tokenVerifierHandler: (
            req,
            data,
        ) => applyTokenVerificationData(req, data, options.fakeAbilities),
    });

    router.use(coreHandler((
        req,
        res,
        next,
    ) => middleware(req, res, next)));
}
