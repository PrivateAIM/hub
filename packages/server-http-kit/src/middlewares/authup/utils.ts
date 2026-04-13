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
import type { Request } from 'routup';
import { RequestPermissionChecker, setRequestEnv } from '../../request/index.ts';
import { FakePermissionProvider } from './permission-provider.ts';

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

export function createFakeTokenVerificationData(): TokenVerificationDataMinimal {
    return {
        realm_id: 'd94b2f28-29e3-4ced-b8f1-6923a01dc1ee',
        realm_name: REALM_MASTER_NAME,

        sub_kind: 'user',
        sub: 'd94b2f28-29e3-4ced-b8f1-6923a01dc1ee',
        sub_name: 'start123',

        permissions: [],
    };
}

export function applyTokenVerificationData(
    req: Request,
    data: TokenVerificationDataMinimal,
    fakeAbilities?: boolean,
) {
    let repository : IPermissionProvider;
    if (fakeAbilities) {
        repository = new FakePermissionProvider();
    } else {
        repository = new PermissionMemoryProvider(data.permissions.map((p) => ({
            permission: {
                name: p.name,
                realm_id: p.realm_id,
                client_id: p.client_id,
            },
        })));
    }

    const permissionEvaluator = new PermissionEvaluator({ repository });
    const requestPermissionChecker = new RequestPermissionChecker(req, permissionEvaluator);
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

    setRequestEnv(req, 'scopes', unwrapOAuth2Scope(data.scope || []));
}
