/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MiddlewareSwaggerOptions } from '@privateaim/server-http-kit';
import {
    createAuthupTokenVerifier,
    mountErrorMiddleware,
    mountMiddlewares,
} from '@privateaim/server-http-kit';
import {
    EnvironmentName,
    createAuthupClientTokenCreator,
    isAuthupClientUsable,
    isRedisClientUsable,
    useAuthupClient,
    useRedisClient,
} from '@privateaim/server-kit';
import { Router, coreHandler } from 'routup';
import { useEnv } from '../config/index.ts';
import { BucketController, BucketFileController } from './controllers/index.ts';

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
            tokenVerifier: createAuthupTokenVerifier({
                baseURL: useEnv('authupURL'),
                creator: createAuthupClientTokenCreator({
                    baseURL: useEnv('authupURL'),
                    clientId: useEnv('clientId'),
                    clientSecret: useEnv('clientSecret'),
                    realm: useEnv('realm'),
                }),
            }),
        },
        swagger,
        decorators: {
            controllers: [
                BucketController,
                BucketFileController,
            ],
        },
    });

    mountErrorMiddleware(router);

    router.get('/', coreHandler(() => ({
        timestamp: Date.now(),
    })));

    return router;
}
