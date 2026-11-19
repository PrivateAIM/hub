/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { OAuth2TokenGrant, OAuth2TokenTypeIdentifier } from '@authup/specs';
import { ErrorCode, HubError } from '@privateaim/errors';
import { isObject } from '@privateaim/kit';
import { Client, isClientErrorDueTimeout, isHttpResponseError } from 'hapic';
import { HTTPClientTimeout } from '../constants';
import type {
    AuthupTokenExchangeBody,
    AuthupTokenExchangeContext,
    AuthupTokenExchangeInput,
    AuthupTokenExchangeResult,
} from './types.ts';

/**
 * Exchange an access token for a capability token (RFC 8693) as the acting
 * client. A request or body read past the deadline is a 504
 * `upstream_timeout`; every other failure is a 502 `upstream_error`, a
 * refused subject token (`invalid_grant`) included: the caller's token was
 * authenticated before the exchange, so a refusal is a delegation problem,
 * and a 401 would sign the user out.
 */
export async function exchangeAuthupToken(
    ctx: AuthupTokenExchangeContext,
    input: AuthupTokenExchangeInput,
): Promise<AuthupTokenExchangeResult> {
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

    // hapic bounds dispatch and body read alike and keeps a sub-path of the
    // base URL (`https://host/auth` + `token`).
    const client = new Client({ baseURL: ctx.baseURL, timeout: HTTPClientTimeout.AUTHUP });

    let data: unknown;

    try {
        const response = await client.post('token', form);

        data = response.data;
    } catch (e) {
        if (isClientErrorDueTimeout(e)) {
            throw new HubError({
                code: ErrorCode.UPSTREAM_TIMEOUT,
                status: 504,
                message: 'The token exchange request to Authup timed out.',
                cause: e,
            });
        }

        if (isHttpResponseError(e)) {
            const body: AuthupTokenExchangeBody = isObject(e.response?.data) ? e.response.data : {};
            const detail = [body.error, body.error_description].filter(Boolean).join(': ');

            throw new HubError({
                code: 'upstream_error',
                status: 502,
                message: detail || `The token exchange failed (${e.status}).`,
            });
        }

        throw new HubError({
            code: 'upstream_error',
            status: 502,
            message: 'The token exchange request to Authup failed.',
            cause: e,
        });
    }

    const body: AuthupTokenExchangeBody = isObject(data) ? data : {};

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
