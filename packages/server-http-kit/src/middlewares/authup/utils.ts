/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { unwrapOAuth2Scope } from '@authup/specs';
import type { IPermissionProvider } from '@authup/access';
import { PermissionEvaluator, PermissionMemoryProvider } from '@authup/access';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import type { IClient } from '@authup/core-http-kit';
import { createAuthupPermissionEvaluator } from '@privateaim/server-kit';
import type { TokenVerificationData } from '@authup/server-adapter-kit';
import type { IAppEvent } from 'routup';
import { RequestPermissionChecker, setRequestEnv } from '../../request/index.ts';
import { FakePermissionProvider } from './permission-provider.ts';

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

export function createFakeTokenVerificationData(): TokenVerificationDataMinimal {
    return {
        realm_id: 'd94b2f28-29e3-4ced-b8f1-6923a01dc1ee',
        realm_name: REALM_MASTER_NAME,

        sub_kind: 'user',
        sub: 'd94b2f28-29e3-4ced-b8f1-6923a01dc1ee',

        permissions: [],
    };
}

export async function applyTokenVerificationData(
    event: IAppEvent,
    data: TokenVerificationDataMinimal,
    fakeAbilities?: boolean,
    authupClient?: IClient,
) {
    let repository : IPermissionProvider;
    if (fakeAbilities) {
        repository = new FakePermissionProvider();
    } else {
        repository = new PermissionMemoryProvider([]);
    }

    const permissionEvaluator = authupClient && !fakeAbilities ?
        await createAuthupPermissionEvaluator(authupClient, {
            grants: data.permissions,
            identity: {
                id: data.sub,
                type: data.sub_kind,
                realmId: data.realm_id,
                realmName: data.realm_name,
                clientId: data.sub_kind === 'client' ? data.sub : null,
            },
        }) : new PermissionEvaluator({
            provider: repository,
            realmId: null,
            clientId:null,
        });
    const requestPermissionChecker = new RequestPermissionChecker(event, permissionEvaluator);
    setRequestEnv(event, 'permissionChecker', requestPermissionChecker);

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

    setRequestEnv(event, 'scopes', unwrapOAuth2Scope(data.scope || []));
}
