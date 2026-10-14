/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ITokenVerifier } from '@authup/server-adapter-kit';
import { verifyRequest } from '@authup/server-adapter-web';
import { assertIntrospectableToken } from '@privateaim/server-kit';
import { useRequestCookie } from '@routup/basic/cookie';
import type { App } from 'routup';
import { defineCoreHandler } from 'routup';
import type { AuthorizationMiddlewareRegistrationOptions } from './types.ts';
import { applyTokenVerificationData, resolveAccessTokenCookieName } from './utils.ts';

/**
 * Refuses a credential that is not structurally a token before it reaches
 * introspection — see `isIntrospectableToken` for the credential confusion
 * this closes (a malformed bearer was reported as the service's own client).
 * Every credential source (header, cookie fallback) funnels through
 * `verify`, so the guard lives on the verifier rather than on one source.
 */
function guardTokenVerifier(verifier: ITokenVerifier): ITokenVerifier {
    return {
        verify: async (token, verifyOptions) => {
            assertIntrospectableToken(token);
            return verifier.verify(token, verifyOptions);
        },
    };
}

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

    const tokenVerifier = options.tokenVerifier ?
        guardTokenVerifier(options.tokenVerifier) :
        undefined;

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
