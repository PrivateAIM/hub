/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { UnauthorizedError } from '@privateaim/errors';

/**
 * The bounds authup's token-endpoint request validator applies to the body
 * `token` — its ONLY rules (authup
 * `apps/server-core/src/adapters/http/controllers/workflows/token/utils/validator.ts`,
 * `TokenRequestValidator`: `z.string().min(16).max(2048)`, unchanged through
 * 1.0.0-beta.70). A rejection by that validator is exactly what triggered the
 * fallback to the caller's own bearer, so these bounds are mirrored verbatim;
 * the compact-JWS shape check below is stricter still.
 */
const TOKEN_MIN_LENGTH = 16;
const TOKEN_MAX_LENGTH = 2048;

const BASE64URL_SEGMENT = /^[A-Za-z0-9_-]+$/;

/**
 * Whether a caller-supplied credential is structurally a compact JWS
 * (`header.payload.signature`, three non-empty base64url segments) within
 * the length bounds authup's introspection endpoint validates.
 *
 * This is a guard against credential confusion, not a validity check. When
 * the body `token` of an introspection request fails authup's validator,
 * authup (<= 1.0.0-beta.69) falls back to the token in the REQUEST's own
 * `Authorization` header — and the token verifier introspects with the
 * service's own credentials inherited onto that header. A bearer that is
 * too short, too long or otherwise unparseable was therefore reported as
 * the hub service client itself (`active: true`, `global`, its grants), and
 * cached under the caller's string. Anything that passes this guard also
 * passes authup's validator, so it is introspected as itself.
 *
 * Fixed server-side in authup#3724, shipped in 1.0.0-beta.70: the server now
 * answers such a token `active: false`. The client side does NOT close it:
 * the beta.70 verifier (vouchly, remote mode with `opaque: 'authup'`)
 * forwards every non-empty string, compact or not and of any length, to
 * introspection. So against an Authup server <= 1.0.0-beta.69 this guard is
 * still the only thing between a garbage bearer and the service's own
 * identity (verified: an unguarded beta.70 verifier against a beta.69 server
 * accepts `not-a-token` and a >2048-character JWS as the `system` client).
 * Hub requires an Authup server >= 1.0.0-beta.70, so the guard is defence in
 * depth: it keeps a deployment that upgraded hub before its Authup server
 * closed, and spares the client-credentials mint and the introspection
 * round-trip for a token that cannot be valid.
 */
export function isIntrospectableToken(token: unknown): token is string {
    if (typeof token !== 'string') {
        return false;
    }

    if (token.length < TOKEN_MIN_LENGTH || token.length > TOKEN_MAX_LENGTH) {
        return false;
    }

    const segments = token.split('.');
    if (segments.length !== 3) {
        return false;
    }

    return segments.every((segment) => BASE64URL_SEGMENT.test(segment));
}

export function assertIntrospectableToken(token: unknown): asserts token is string {
    if (!isIntrospectableToken(token)) {
        throw new UnauthorizedError('The access token is malformed.');
    }
}
