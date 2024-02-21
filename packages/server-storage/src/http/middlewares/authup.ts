/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AbilityManager } from '@authup/core';
import { createHTTPMiddleware } from '@authup/server-adapter';
import type { TokenVerifierRedisCacheOptions } from '@authup/server-adapter';
import { useRequestCookie } from '@routup/basic/cookie';
import { coreHandler } from 'routup';
import type { Router } from 'routup';
import { useEnv } from '../../config';
import { hasRedis, useRedis } from '../../core';
import { setRequestEnv } from '../request';

export function mountAuthupMiddleware(router: Router) {
    let tokenCache : TokenVerifierRedisCacheOptions | undefined;
    if (hasRedis()) {
        tokenCache = {
            type: 'redis',
            client: useRedis(),
        };
    }

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
        tokenVerifierHandler: (req, data) => {
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
        },
    });

    router.use(coreHandler((req, res, next) => middleware(req, res, next)));
}
