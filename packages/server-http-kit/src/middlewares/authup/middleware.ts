/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { verifyRequest } from '@authup/server-adapter-web';
import { useRequestCookie } from '@routup/basic/cookie';
import type { App } from 'routup';
import { defineCoreHandler } from 'routup';
import type { AuthorizationMiddlewareRegistrationOptions } from './types.ts';
import { applyTokenVerificationData, resolveAccessTokenCookieName } from './utils.ts';

export function mountAuthorizationMiddleware(
    app: App,
    options: AuthorizationMiddlewareRegistrationOptions,
) {
    // Fail closed. Without an Authup client no request can be verified, so
    // none is attached an identity and `ForceLoggedInMiddleware` answers 401.
    // There used to be a fallback that attached a fixed master-realm user to
    // EVERY request instead — server-messenger ran on it in production.
    const { authupClient } = options;

    if (!authupClient) {
        return;
    }

    const { tokenVerifier } = options;

    app.use(defineCoreHandler(async (event) => {
        try {
            const data = await verifyRequest(event.request, {
                tokenVerifier,
                tokenByRequest: () => {
                    const cookieToken = useRequestCookie(event, resolveAccessTokenCookieName(options.cookiePrefix));

                    if (cookieToken) {
                        return cookieToken;
                    }

                    return undefined;
                },
            });

            if (data) {
                await applyTokenVerificationData(event, data, authupClient);
            }
        } catch (err) {
            return event.next(err);
        }

        return event.next();
    }));
}
