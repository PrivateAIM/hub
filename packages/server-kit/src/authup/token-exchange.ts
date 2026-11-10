/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { OAuth2TokenGrant, OAuth2TokenTypeIdentifier } from '@authup/specs';
import { HubError, UnauthorizedError } from '@privateaim/errors';
import type {
    AuthupTokenExchangeBody,
    AuthupTokenExchangeContext,
    AuthupTokenExchangeInput,
    AuthupTokenExchangeResult,
} from './types.ts';

/**
 * Exchange an access token for a capability token (RFC 8693) as the acting
 * client. A refused subject token (`invalid_grant`) is an `UnauthorizedError`;
 * every other failure (misconfigured delegation, 5xx, network) is a 502
 * `upstream_error`.
 */
export async function exchangeAuthupToken(
    ctx: AuthupTokenExchangeContext,
    input: AuthupTokenExchangeInput,
): Promise<AuthupTokenExchangeResult> {
    const base = ctx.baseURL.endsWith('/') ? ctx.baseURL : `${ctx.baseURL}/`;

    const form = new URLSearchParams({
        grant_type: OAuth2TokenGrant.TOKEN_EXCHANGE,
        subject_token: input.subjectToken,
        subject_token_type: OAuth2TokenTypeIdentifier.ACCESS_TOKEN,
        audience: input.audience,
        cap: input.cap.join(' '),
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        realm_id: ctx.realm,
    });

    if (typeof input.expiresIn === 'number') {
        form.set('expires_in', String(input.expiresIn));
    }

    let response: Response;

    try {
        response = await fetch(new URL('token', base), {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: form,
        });
    } catch (e) {
        throw new HubError({
            code: 'upstream_error',
            status: 502,
            message: 'The token exchange request to Authup failed.',
            cause: e,
        });
    }

    let body: AuthupTokenExchangeBody = {};

    try {
        body = await response.json();
    } catch {
        // a non-JSON body is handled through the status below
    }

    if (!response.ok) {
        if (body.error === 'invalid_grant') {
            throw new UnauthorizedError(body.error_description || 'The subject token was refused.');
        }

        throw new HubError({
            code: 'upstream_error',
            status: 502,
            message: body.error_description || `The token exchange failed (${response.status}).`,
        });
    }

    if (!body.access_token) {
        throw new HubError({
            code: 'upstream_error',
            status: 502,
            message: 'Authup answered the token exchange without a token.',
        });
    }

    return {
        token: body.access_token,
        expiresIn: body.expires_in ?? 0,
    };
}
