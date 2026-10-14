/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IClient } from '@authup/core-http-kit';
import { createAuthupPermissionEvaluator, resolveAuthupPolicySubject } from '@privateaim/server-kit';
import { unwrapOAuth2Scope } from '@authup/specs';
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
    authupClient: IClient,
) {
    socket.data.identity = {
        type: data.sub_kind,
        id: data.sub,
        realmId: data.realm_id,
        realmName: data.realm_name,
    };

    socket.data.permissionChecker = await createAuthupPermissionEvaluator(authupClient, resolveAuthupPolicySubject({
        scopes: unwrapOAuth2Scope(data.scope || []),
        grants: data.permissions,
        identity: {
            id: data.sub,
            type: data.sub_kind,
            realmId: data.realm_id,
            realmName: data.realm_name,
            clientId: data.sub_kind === 'client' ? data.sub : null,
        },
    }));
}
