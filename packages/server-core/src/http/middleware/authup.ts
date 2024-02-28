/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AbilityManager, REALM_MASTER_NAME } from '@authup/core';
import type { Ability, TokenCreatorOptions } from '@authup/core';
import type { TokenVerificationData, TokenVerifierRedisCacheOptions } from '@authup/server-adapter';
import { createHTTPMiddleware } from '@authup/server-adapter';
import { useClient as useVaultClient } from '@hapic/vault';
import { PermissionID } from '@privateaim/core';
import { coreHandler } from 'routup';
import { useRequestCookie } from '@routup/basic/cookie';
import type { Request, Router } from 'routup';
import { EnvironmentName, useEnv } from '../../config';
import { hasRedisClient, hasVaultClient, useRedisClient } from '../../core';
import { setRequestEnv } from '../request';

type TokenVerificationDataMinimal = Pick<
TokenVerificationData,
'permissions' |
'realm_id' |
'realm_name' |
'sub' |
'sub_kind' |
'sub_name'
>;

function createFakeTokenVerificationData() : TokenVerificationDataMinimal {
    return {
        realm_id: 'd94b2f28-29e3-4ced-b8f1-6923a01dc1ee',
        realm_name: REALM_MASTER_NAME,

        sub_kind: 'user',
        sub: 'd94b2f28-29e3-4ced-b8f1-6923a01dc1ee',
        sub_name: 'admin',

        permissions: Object.values(PermissionID).map((name) => ({
            name,
            condition: null,
            inverse: false,
            power: 999,
            target: null,
        } satisfies Ability)),
    };
}

function applyTokenVerificationData(
    req: Request,
    data: TokenVerificationDataMinimal,
) {
    const ability = new AbilityManager(data.permissions);
    setRequestEnv(req, 'ability', ability);

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

export function registerAuthupMiddleware(router: Router) {
    if (useEnv('env') === EnvironmentName.TEST) {
        const data = createFakeTokenVerificationData();

        router.use(coreHandler((req, res, next) => {
            applyTokenVerificationData(req, data);
            next();
        }));
    } else {
        let tokenCreator : TokenCreatorOptions;
        if (hasVaultClient()) {
            tokenCreator = {
                type: 'robotInVault',
                name: 'system',
                vault: useVaultClient(),
            };
        } else {
            tokenCreator = {
                type: 'user',
                name: 'admin',
                password: 'start123',
            };
        }

        let tokenCache : TokenVerifierRedisCacheOptions | undefined;
        if (hasRedisClient()) {
            tokenCache = {
                type: 'redis',
                client: useRedisClient(),
            };
        }

        const middleware = createHTTPMiddleware({
            tokenByCookie: (req, cookieName) => useRequestCookie(req, cookieName),
            tokenVerifier: {
                baseURL: useEnv('authupApiURL'),
                creator: tokenCreator,
                cache: tokenCache,
            },
            tokenVerifierHandler: (req, data) => applyTokenVerificationData(req, data),
        });

        router.use(coreHandler((req, res, next) => middleware(req, res, next)));
    }
}
