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

export function createFakeTokenVerificationData(): TokenVerificationDataMinimal {
    return {
        realm_id: 'd94b2f28-29e3-4ced-b8f1-6923a01dc1ee',
        realm_name: REALM_MASTER_NAME,

        sub_kind: 'user',
        sub: 'd94b2f28-29e3-4ced-b8f1-6923a01dc1ee',

        permissions: [],
    };
}

/**
 * Introspection delivers each grant's realm/client scope as the OAuth2 wire
 * shape (`realm_id` / `client_id`), while `@authup/access`'s `BasePermission`
 * is camelCase (`realmId` / `clientId`). Those two keys are deliberately NOT
 * forwarded: `PermissionMemoryProvider` indexes a grant by
 * `buildPermissionKey({ name, realmId, clientId })`, but the evaluator is built
 * with `realmId: null, clientId: null` and `RequestPermissionChecker` never
 * supplies per-check overrides, so every lookup keys both scope segments as
 * the wildcard. Populating the grant side alone would key the stored grants
 * by their real realm and client, and make every check miss — denying
 * everything.
 *
 * Until hub scopes lookups too (plan 016, IPermissionEvaluator alignment), the
 * scope is intentionally dropped rather than half-applied. Previously these were
 * passed as `realm_id`/`client_id`, which `BasePermission` silently discarded —
 * the same behaviour, but reading as though the scope were honoured.
 */
export function applyTokenVerificationData(
    event: IAppEvent,
    data: TokenVerificationDataMinimal,
    fakeAbilities?: boolean,
) {
    let repository : IPermissionProvider;
    if (fakeAbilities) {
        repository = new FakePermissionProvider();
    } else {
        repository = new PermissionMemoryProvider(data.permissions.map((p) => ({ permission: { name: p.name } })));
    }

    const permissionEvaluator = new PermissionEvaluator({
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
