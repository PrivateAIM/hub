/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Ability } from '@authup/kit';
import { Abilities } from '@authup/kit';
import { REALM_MASTER_NAME } from '@authup/core-kit';
import type { TokenVerificationData } from '@authup/server-core-plugin-kit';
import { PermissionID } from '@privateaim/core';
import type { Request } from 'routup';
import { setRequestEnv } from '../../request';

type TokenVerificationDataMinimal = Pick<
TokenVerificationData,
'permissions' |
'realm_id' |
'realm_name' |
'sub' |
'sub_kind' |
'sub_name'
>;

function generateAbilities(): Ability[] {
    return Object.values(PermissionID).map((name) => ({
        name,
        condition: null,
        inverse: false,
        power: 999,
        target: null,
    } satisfies Ability));
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
    let abilities: Ability[];
    if (fakeAbilities) {
        abilities = generateAbilities();
    } else {
        abilities = data.permissions;
    }

    const ability = new Abilities(abilities);
    setRequestEnv(req, 'abilities', ability);

    setRequestEnv(req, 'realmId', data.realm_id);
    setRequestEnv(req, 'realmName', data.realm_name);
    setRequestEnv(req, 'realm', {
        id: data.realm_id,
        name: data.realm_name,
    });

    switch (data.sub_kind) {
        case 'user': {
            setRequestEnv(req, 'userId', data.sub);
            setRequestEnv(req, 'userName', data.sub_name);
            break;
        }
        case 'robot': {
            setRequestEnv(req, 'robotId', data.sub);
            setRequestEnv(req, 'robotName', data.sub_name);
            break;
        }
    }
}
