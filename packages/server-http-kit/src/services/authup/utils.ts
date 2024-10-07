/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PermissionItem } from '@authup/kit';
import { PermissionChecker, PermissionMemoryProvider } from '@authup/kit';
import { PermissionName as AuthupPermissionName, REALM_MASTER_NAME, transformOAuth2ScopeToArray } from '@authup/core-kit';
import type { TokenVerificationData } from '@authup/server-adapter-kit';
import { PermissionName } from '@privateaim/kit';
import type { Request } from 'routup';
import { RequestPermissionChecker, setRequestEnv } from '../../request';

type TokenVerificationDataMinimal = Pick<
TokenVerificationData,
'permissions' |
'realm_id' |
'realm_name' |
'sub' |
'sub_kind' |
'sub_name' |
'scope'
>;

function generateAbilities(): PermissionItem[] {
    return Object.values({
        ...PermissionName,
        ...AuthupPermissionName,
    }).map((name) => ({
        name,
    } satisfies PermissionItem));
}

export function createFakeTokenVerificationData(): TokenVerificationDataMinimal {
    return {
        realm_id: 'd94b2f28-29e3-4ced-b8f1-6923a01dc1ee',
        realm_name: REALM_MASTER_NAME,

        sub_kind: 'user',
        sub: 'd94b2f28-29e3-4ced-b8f1-6923a01dc1ee',
        sub_name: 'admin',

        permissions: generateAbilities(),
    };
}

export function applyTokenVerificationData(
    req: Request,
    data: TokenVerificationDataMinimal,
    fakeAbilities?: boolean,
) {
    let abilities: PermissionItem[];
    if (fakeAbilities) {
        abilities = generateAbilities();
    } else {
        abilities = data.permissions;
    }

    const permissionChecker = new PermissionChecker({
        provider: new PermissionMemoryProvider(abilities),
    });
    const requestPermissionChecker = new RequestPermissionChecker(req, permissionChecker);
    setRequestEnv(req, 'permissionChecker', requestPermissionChecker);

    setRequestEnv(req, 'identity', {
        id: data.sub,
        type: data.sub_kind,
        realmId: data.realm_id,
        realmName: data.realm_name,
        attributes: {
            id: data.sub,
            name: data.sub_name,
        },
    });

    setRequestEnv(req, 'scopes', transformOAuth2ScopeToArray(data.scope));
}
