/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName as AuthupPermissionName, REALM_MASTER_NAME } from '@authup/core-kit';
import type { PermissionPolicyBinding } from '@authup/access';
import { PermissionEvaluator, PermissionMemoryProvider } from '@authup/access';
import type { IClient } from '@authup/core-http-kit';
import { createAuthupPermissionEvaluator } from '@privateaim/server-kit';
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

export async function applyTokenVerificationData(
    socket: Socket,
    data: TokenVerificationDataMinimal,
    fakeAbilities?: boolean,
    authupClient?: IClient,
) {
    let abilities: PermissionPolicyBinding[];
    if (fakeAbilities) {
        abilities = generateAbilityNames().map((name) => ({ permission: { name } }));
    } else {
        abilities = [];
    }

    socket.data.identity = {
        type: data.sub_kind,
        id: data.sub,
        realmId: data.realm_id,
        realmName: data.realm_name,
    };

    socket.data.permissionChecker = authupClient && !fakeAbilities ?
        await createAuthupPermissionEvaluator(authupClient, {
            grants: data.permissions,
            identity: {
                id: data.sub,
                type: data.sub_kind,
                realmId: data.realm_id,
                realmName: data.realm_name,
                clientId: data.sub_kind === 'client' ? data.sub : null,
            },
        }) : new PermissionEvaluator({ provider: new PermissionMemoryProvider(abilities) });
}
