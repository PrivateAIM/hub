/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IAuthorizationCatalogCache } from '@authup/server-kit/core';
import { createAuthupPermissionEvaluator, resolveAuthupPolicySubject } from '@privateaim/server-kit';
import type { TokenVerificationData } from '@authup/server-adapter-kit';
import type { Socket } from '../../types';

type TokenVerificationDataMinimal = Pick<
    TokenVerificationData,
'permissions' |
'realm_id' |
'realm_name' |
'sub' |
'sub_kind' |
'scope'
>;

export async function applyTokenVerificationData(
    socket: Socket,
    data: TokenVerificationDataMinimal,
    catalogCache: IAuthorizationCatalogCache,
) {
    socket.data.identity = {
        type: data.sub_kind,
        id: data.sub,
        realmId: data.realm_id,
        realmName: data.realm_name,
    };

    socket.data.permissionEvaluator = await createAuthupPermissionEvaluator(catalogCache, resolveAuthupPolicySubject(data));
}
