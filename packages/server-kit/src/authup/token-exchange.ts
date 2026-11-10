/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { OAuth2TokenGrant, OAuth2TokenTypeIdentifier } from '@authup/specs';
import { HubError } from '@privateaim/errors';
import type {
    AuthupTokenExchangeBody,
    AuthupTokenExchangeContext,
    AuthupTokenExchangeInput,
    AuthupTokenExchangeResult,
} from './types.ts';

/**
 * Exchange an access token for a capability token (RFC 8693) as the acting
 * client. Every failure is a 502 `upstream_error`, a
 * refused subject token (`invalid_grant`) included: the caller's token was
 * authenticated before the exchange, so a refusal is a delegation problem,
 * and a 401 would sign the user out.
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
        const parsed = await response.json();

        if (typeof parsed === 'object' && parsed !== null) {
            body = parsed;
        }
    } catch {
        // a non-JSON body is handled through the status below
    }

    if (!response.ok) {
        const detail = [body.error, body.error_description].filter(Boolean).join(': ');

        throw new HubError({
            code: 'upstream_error',
            status: 502,
            message: detail || `The token exchange failed (${response.status}).`,
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
