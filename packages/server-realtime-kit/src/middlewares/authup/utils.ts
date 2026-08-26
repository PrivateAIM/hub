/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName as AuthupPermissionName, REALM_MASTER_NAME } from '@authup/core-kit';
import type { PermissionPolicyBinding } from '@authup/access';
import { PermissionEvaluator, PermissionMemoryProvider } from '@authup/access';
import type { TokenVerificationData } from '@authup/server-adapter-kit';
import { PermissionName } from '@privateaim/kit';
import type { Socket } from '../../types';

type TokenVerificationDataMinimal = Pick<
    TokenVerificationData,
'permissions' |
'realm_id' |
'realm_name' |
'sub' |
'sub_kind'
>;

function generateAbilityNames(): string[] {
    return Object.values({
        ...PermissionName,
        ...AuthupPermissionName,
    });
}

export function createFakeTokenVerificationData(): TokenVerificationDataMinimal {
    return {
        realm_id: 'd94b2f28-29e3-4ced-b8f1-6923a01dc1ee',
        realm_name: REALM_MASTER_NAME,

        sub_kind: 'user',
        sub: 'd94b2f28-29e3-4ced-b8f1-6923a01dc1ee',

        permissions: generateAbilityNames().map((name) => ({ name })),
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
    socket: Socket,
    data: TokenVerificationDataMinimal,
    fakeAbilities?: boolean,
) {
    let abilities: PermissionPolicyBinding[];
    if (fakeAbilities) {
        abilities = generateAbilityNames().map((name) => ({ permission: { name } }));
    } else {
        abilities = data.permissions.map((p) => ({ permission: { name: p.name } }));
    }

    socket.data.identity = {
        type: data.sub_kind,
        id: data.sub,
        realmId: data.realm_id,
        realmName: data.realm_name,
    };

    socket.data.permissionChecker = new PermissionEvaluator({ provider: new PermissionMemoryProvider(abilities) });
}
