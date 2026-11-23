/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { OAuth2SubKind, OAuth2TokenKind, unwrapOAuth2Scope } from '@authup/specs';
import type { IClient } from '@authup/core-http-kit';
import { UnauthorizedError } from '@privateaim/errors';
import type { CapabilityEntry } from '@privateaim/kit';
import { isObject, parseCapabilityEntries } from '@privateaim/kit';
import { createAuthupPermissionEvaluator, resolveAuthupPolicySubject } from '@privateaim/server-kit';
import type { TokenVerificationData } from '@authup/server-adapter-kit';
import type { IAppEvent } from 'routup';
import type { RequestCapability, RequestCapabilitySource } from '../../request/index.ts';
import { setRequestEnv } from '../../request/index.ts';

type TokenVerificationDataMinimal = Pick<
    TokenVerificationData,
'permissions' |
'realm_id' |
'realm_name' |
'sub' |
'sub_kind' |
'scope'
>;

/**
 * Namespaces the cookie-fallback token lookup the same way
 * `@authup/client-web-nuxt`'s `cookiePrefix` module option namespaces the
 * cookie it writes. `prefix` is empty by default, so the bare `access_token`
 * name is unchanged for every deployment that hasn't widened its cookie
 * domain.
 */
export function resolveAccessTokenCookieName(prefix?: string): string {
    return `${prefix ?? ''}access_token`;
}

/**
 * The `kind` claim of a compact JWS, read WITHOUT verification. It only
 * picks the verifier: each verifier checks `kind` on the claims it verified
 * itself, so a lying payload ends in a refused token, never in a capability
 * read as an identity or the reverse. Anything unreadable is `undefined`.
 */
export function peekTokenKind(token: string): string | undefined {
    const segments = token.split('.');

    if (segments.length !== 3) {
        return undefined;
    }

    let payload: unknown;

    try {
        payload = JSON.parse(Buffer.from(segments[1], 'base64url').toString('utf8'));
    } catch {
        return undefined;
    }

    if (!isObject(payload) || typeof payload.kind !== 'string') {
        return undefined;
    }

    return payload.kind;
}

export function isCapabilityTokenKind(kind: unknown): boolean {
    return kind === OAuth2TokenKind.CAPABILITY;
}

function isNonEmptyString(input: unknown): input is string {
    return typeof input === 'string' && input.length > 0;
}

function isEpochSeconds(input: unknown): input is number {
    return typeof input === 'number' && Number.isFinite(input);
}

/**
 * Builds the request capability from a verified capability token. Every
 * claim is guarded: a claim the capability cannot be built without, a
 * subject kind other than user/client, a `cap` that is not a list of
 * well-formed entries, or a malformed `act` refuses the token (401) — the
 * signature being valid does not make a capability usable.
 */
export function buildRequestCapability(
    data: TokenVerificationData,
    source: RequestCapabilitySource,
): RequestCapability {
    if (!isCapabilityTokenKind(data.kind)) {
        throw new UnauthorizedError('The token is not a capability token.');
    }

    const {
        sub,
        sub_kind: subKind,
        realm_id: realmId,
        realm_name: realmName,
        iat,
        exp,
        cap,
        act,
    } = data;

    if (!isNonEmptyString(sub) || !isNonEmptyString(realmId)) {
        throw new UnauthorizedError('The capability token names no subject.');
    }

    if (subKind !== OAuth2SubKind.USER && subKind !== OAuth2SubKind.CLIENT) {
        throw new UnauthorizedError('The capability token names no valid subject kind.');
    }

    if (typeof realmName !== 'undefined' && typeof realmName !== 'string') {
        throw new UnauthorizedError('The capability token names an invalid realm.');
    }

    if (!isEpochSeconds(iat) || !isEpochSeconds(exp)) {
        throw new UnauthorizedError('The capability token carries no valid lifetime.');
    }

    if (!Array.isArray(cap)) {
        throw new UnauthorizedError('The capability token carries no valid capability.');
    }

    const hasForeignEntry = cap.some((entry) => typeof entry !== 'string');

    if (hasForeignEntry) {
        throw new UnauthorizedError('The capability token carries no valid capability.');
    }

    let entries: CapabilityEntry[];

    try {
        entries = parseCapabilityEntries(cap);
    } catch {
        // No `cause`: the error middleware renders `error.cause` when one is
        // set, which would turn the TypeError into a 500.
        throw new UnauthorizedError('The capability token carries a malformed capability.');
    }

    let actor: RequestCapability['actor'];

    if (typeof act !== 'undefined') {
        if (
            !isObject(act) ||
            !isNonEmptyString(act.sub) ||
            (typeof act.sub_kind !== 'undefined' && typeof act.sub_kind !== 'string')
        ) {
            throw new UnauthorizedError('The capability token names an invalid actor.');
        }

        actor = { id: act.sub, type: act.sub_kind };
    }

    return {
        subject: {
            id: sub,
            type: subKind,
            realmId,
            realmName,
        },
        actor,
        entries,
        issuedAt: iat,
        expiresAt: exp,
        source,
    };
}

export async function applyTokenVerificationData(
    event: IAppEvent,
    data: TokenVerificationDataMinimal,
    authupClient: IClient,
) {
    const scopes = unwrapOAuth2Scope(data.scope || []);

    const permissionEvaluator = await createAuthupPermissionEvaluator(authupClient, resolveAuthupPolicySubject(data));

    setRequestEnv(event, 'permissionEvaluator', permissionEvaluator);

    setRequestEnv(event, 'identity', {
        id: data.sub,
        type: data.sub_kind,
        realmId: data.realm_id,
        realmName: data.realm_name,
        /**
         * Only the subject id is carried. `name` used to read the payload's
         * subject-name claim, which authup removed in `1.0.0-beta.63` as a
         * claim it never populated -- so this attribute has always resolved
         * to `undefined`, and with it `metadata.actorName` on every audited
         * write. Dropping it is behaviour-preserving.
         *
         * Do NOT restore it by reading a claim off the introspection payload:
         * `JWTClaims` carries an index signature, so any key type-checks as
         * `any` and a wrong guess fails silently rather than at the compiler.
         * Re-populating the audit actor name needs the claim declared on the
         * payload type upstream first.
         */
        attributes: { id: data.sub },
    });

    setRequestEnv(event, 'scopes', scopes);
}
