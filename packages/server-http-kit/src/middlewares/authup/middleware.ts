/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { verifyRequest } from '@authup/server-adapter-web';
import { useRequestCookie } from '@routup/basic/cookie';
import type { Router } from 'routup';
import { defineCoreHandler } from 'routup';
import type { AuthorizationMiddlewareRegistrationOptions } from './types.ts';
import { applyTokenVerificationData, createFakeTokenVerificationData } from './utils.ts';

export function mountAuthorizationMiddleware(
    router: Router,
    options: AuthorizationMiddlewareRegistrationOptions,
) {
    if (!options.authupClient) {
        const data = createFakeTokenVerificationData();

        router.use(defineCoreHandler((event) => {
            applyTokenVerificationData(event, data, options.dryRun);
        }));

        return;
    }

    router.use(defineCoreHandler(async (event) => {
        const data = await verifyRequest(event.request, {
            tokenVerifier: options.tokenVerifier,
            tokenByRequest: () => {
                const cookieToken = useRequestCookie(event, 'access_token');
                if (cookieToken) {
                    return cookieToken;
                }

                return undefined;
            },
        });

        if (data) {
            applyTokenVerificationData(event, data, options.dryRun);
        }
    }));
}
