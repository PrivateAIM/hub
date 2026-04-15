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
'sub_kind' |
'sub_name'
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
        sub_name: 'system',

        permissions: generateAbilityNames().map((name) => ({ name })),
    };
}

export function applyTokenVerificationData(
    socket: Socket,
    data: TokenVerificationDataMinimal,
    fakeAbilities?: boolean,
) {
    let abilities: PermissionPolicyBinding[];
    if (fakeAbilities) {
        abilities = generateAbilityNames().map((name) => ({ permission: { name } }));
    } else {
        abilities = data.permissions.map((p) => ({
            permission: {
                name: p.name,
                realm_id: p.realm_id,
                client_id: p.client_id,
            },
        }));
    }

    socket.data.identity = {
        type: data.sub_kind,
        id: data.sub,
        realmId: data.realm_id,
        realmName: data.realm_name,
    };

    socket.data.permissionChecker = new PermissionEvaluator({ provider: new PermissionMemoryProvider(abilities) });
}
