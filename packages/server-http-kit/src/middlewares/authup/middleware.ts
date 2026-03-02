/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createMiddleware } from '@authup/server-adapter-http';
import { useRequestCookie } from '@routup/basic/cookie';
import type { Router } from 'routup';
import { coreHandler } from 'routup';
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
