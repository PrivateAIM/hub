/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createMiddleware } from '@authup/server-adapter-http';
import { useRequestCookie } from '@routup/basic/cookie';
import { parseAuthorizationHeader } from 'hapic';
import type { Router } from 'routup';
import { coreHandler, getRequestHeader } from 'routup';
import type { AuthorizationMiddlewareRegistrationOptions } from './types.ts';
import { applyTokenVerificationData, createFakeTokenVerificationData } from './utils.ts';

export function mountAuthorizationMiddleware(
    router: Router,
    options: AuthorizationMiddlewareRegistrationOptions,
) {
    if (!options.authupClient) {
        const data = createFakeTokenVerificationData();

        router.use(coreHandler((req, res, next) => {
            applyTokenVerificationData(req, data, options.dryRun);
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
            const token = await options.authupClient.token.createWithClientCredentials({
                client_id: header.username,
                client_secret: header.password,
            });

            req.headers.authorization = `Bearer ${token.access_token}`;
            if (options.redisClient) {
                await options.redisClient.setex(cacheKey, token.expires_in, token.access_token);
            }
        }

        next();
    }));

    const middleware = createMiddleware({
        tokenByCookie: (req, cookieName) => useRequestCookie(req, cookieName),
        tokenVerifier: options.tokenVerifier,
        tokenVerifierHandler: (
            req,
            data,
        ) => applyTokenVerificationData(req, data, options.dryRun),
    });

    router.use(coreHandler((
        req,
        res,
        next,
    ) => middleware(req, res, next)));
}
