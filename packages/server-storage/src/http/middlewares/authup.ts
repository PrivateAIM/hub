/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AbilityDescriptor } from '@authup/core';
import { AbilityManager, REALM_MASTER_NAME } from '@authup/core';
import { createHTTPMiddleware } from '@authup/server-adapter';
import type { TokenVerificationData, TokenVerifierRedisCacheOptions } from '@authup/server-adapter';
import { PermissionID } from '@privateaim/core';
import { useRequestCookie } from '@routup/basic/cookie';
import { coreHandler } from 'routup';
import type { Request, Router } from 'routup';
import { EnvironmentName, useEnv } from '../../config';
import { hasRedis, useRedis } from '../../core';
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
        } as AbilityDescriptor)),
    };
}

export function mountAuthupMiddleware(router: Router) {
    let tokenCache : TokenVerifierRedisCacheOptions | undefined;
    if (hasRedis()) {
        tokenCache = {
            type: 'redis',
            client: useRedis(),
        };
    }

    const applyTokenVerificationData = (
        req: Request,
        data: TokenVerificationDataMinimal,
    ) => {
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
    };

    if (useEnv('env') === EnvironmentName.TEST) {
        const data = createFakeTokenVerificationData();

        router.use(coreHandler((req, res, next) => {
            applyTokenVerificationData(req, data);
            next();
        }));
    } else {
        const middleware = createHTTPMiddleware({
            tokenByCookie: (req, cookieName) => useRequestCookie(req, cookieName),
            tokenVerifier: {
                baseURL: useEnv('authupApiURL'),
                // todo: this should be robot/vault strategy
                creator: {
                    type: 'user',
                    name: 'admin',
                    password: 'start123',
                },
                cache: tokenCache,
            },
            tokenVerifierHandler: (req, data) => applyTokenVerificationData(req, data),
        });

        router.use(coreHandler((req, res, next) => middleware(req, res, next)));
    }
}
