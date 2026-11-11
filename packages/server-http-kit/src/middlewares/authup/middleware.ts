/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IClient } from '@authup/core-http-kit';
import type { ITokenVerifier } from '@authup/server-adapter-kit';
import { extractBearerToken } from '@authup/server-adapter-kit';
import { OAuth2TokenKind } from '@authup/specs';
import { UnauthorizedError } from '@privateaim/errors';
import type { App, IAppEvent } from 'routup';
import { defineCoreHandler } from 'routup';
import { setRequestEnv } from '../../request/index.ts';
import type { RequestCapabilitySource } from '../../request/index.ts';
import type { AuthorizationMiddlewareRegistrationOptions } from './types.ts';
import {
    applyTokenVerificationData,
    buildRequestCapability,
    isCapabilityTokenKind,
    peekTokenKind,
} from './utils.ts';

/**
 * The longest lifetime (`exp - iat`) of a capability token passed in the
 * query: a URL ends up in logs, histories and referrers, so only a token
 * minted for one immediate download may travel there.
 */
const QUERY_CAPABILITY_MAX_LIFETIME = 60;

const QUERY_CAPABILITY_PARAMETER = 'dt';

async function applyIdentityToken(
    event: IAppEvent,
    token: string,
    tokenVerifier: ITokenVerifier,
    authupClient: IClient,
) {
    const data = await tokenVerifier.verify(token);

    // Defence in depth: the access-token verifier already refuses any kind
    // but an access token. A capability token must never become an identity.
    if (typeof data.kind !== 'undefined' && data.kind !== OAuth2TokenKind.ACCESS) {
        throw new UnauthorizedError('Only an access token identifies a caller.');
    }

    await applyTokenVerificationData(event, data, authupClient);

    setRequestEnv(event, 'token', token);
}

async function applyCapabilityToken(
    event: IAppEvent,
    token: string,
    verifier: ITokenVerifier,
    source: RequestCapabilitySource,
) {
    const capability = buildRequestCapability(await verifier.verify(token), source);

    if (
        source === 'query' &&
        capability.expiresAt - capability.issuedAt > QUERY_CAPABILITY_MAX_LIFETIME
    ) {
        throw new UnauthorizedError(
            `A capability token in the query may live at most ${QUERY_CAPABILITY_MAX_LIFETIME} seconds.`,
        );
    }

    setRequestEnv(event, 'capability', capability);
}

/**
 * Credential precedence: the `Authorization` header, then (only with
 * `options.capability`) the query capability token. Exactly one
 * credential is verified per request; a cookie is never read.
 *
 * A capability request gets `capability` and no identity, no permission
 * evaluator and no `token`, so every `ForceLoggedInMiddleware` route answers
 * it 401.
 */
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

    const { tokenVerifier, capability } = options;

    app.use(defineCoreHandler(async (event) => {
        try {
            // An empty header falls through to the next source, as with
            // `verifyRequest` of `@authup/server-adapter-web`.
            const headerToken = extractBearerToken(event.request.headers.get('authorization') || undefined);

            if (headerToken) {
                // The unverified kind only picks the verifier; see `peekTokenKind`.
                if (capability && isCapabilityTokenKind(peekTokenKind(headerToken))) {
                    await applyCapabilityToken(event, headerToken, capability.verifier, 'header');
                } else {
                    await applyIdentityToken(event, headerToken, tokenVerifier, authupClient);
                }

                return event.next();
            }

            if (capability) {
                const queryTokens = event.searchParams.getAll(capability.queryParameter ?? QUERY_CAPABILITY_PARAMETER);

                if (queryTokens.length > 0) {
                    if (queryTokens.length > 1) {
                        throw new UnauthorizedError('Only one capability token may be passed in the query.');
                    }

                    const [queryToken] = queryTokens;

                    // Never verify an access token from the query: a URL is no place for one.
                    if (!isCapabilityTokenKind(peekTokenKind(queryToken))) {
                        throw new UnauthorizedError('Only a capability token may be passed in the query.');
                    }

                    await applyCapabilityToken(event, queryToken, capability.verifier, 'query');

                    return event.next();
                }
            }
        } catch (err) {
            return event.next(err);
        }

        return event.next();
    }));
}
