/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ITokenVerifier } from '@authup/server-adapter-kit';
import { EnvironmentName } from '@privateaim/kit';
import type { MiddlewareSwaggerOptions } from '@privateaim/server-http-kit';
import {
    createAuthupTokenVerifier,
    mountErrorMiddleware,
    mountMiddlewares,
} from '@privateaim/server-http-kit';
import {
    createAuthupClientTokenCreator,
    isAuthupClientUsable,
    isRedisClientUsable,
    useAuthupClient,
    useRedisClient,
} from '@privateaim/server-kit';
import { Router, coreHandler } from 'routup';
import { useEnv } from '../config/index.ts';

export function createHTTPRouter() : Router {
    const router = new Router();

    let swagger : MiddlewareSwaggerOptions | boolean;
    if (useEnv('env') !== EnvironmentName.TEST) {
        swagger = {
            baseURL: useEnv('publicURL'),
        };
    } else {
        swagger = false;
    }

    let tokenVerifier : ITokenVerifier | undefined;

    const authupBaseURL = useEnv('authupURL');
    if (authupBaseURL) {
        tokenVerifier = createAuthupTokenVerifier({
            baseURL: authupBaseURL,
            creator: createAuthupClientTokenCreator({
                baseURL: authupBaseURL,
                clientId: useEnv('clientId'),
                clientSecret: useEnv('clientSecret'),
                realm: useEnv('realm'),
            }),
        });
    }

    mountMiddlewares(router, {
        basic: true,
        cors: true,
        prometheus: true,
        rateLimit: true,
        authorization: {
            authupClient: isAuthupClientUsable() ?
                useAuthupClient() :
                undefined,
            redisClient: isRedisClientUsable() ?
                useRedisClient() :
                undefined,
            dryRun: useEnv('env') === EnvironmentName.TEST,
            tokenVerifier,
        },
        swagger,
        decorators: {
            controllers: [

            ],
        },
    });

    mountErrorMiddleware(router);

    router.get('/', coreHandler(() => ({
        timestamp: Date.now(),
    })));

    return router;
}
