/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MiddlewareSwaggerOptions } from '@privateaim/server-http-kit';
import {
    mountErrorMiddleware,
    mountMiddlewares,
} from '@privateaim/server-http-kit';
import { Router, coreHandler } from 'routup';
import { EnvironmentName, useEnv } from '../config';
import {
    hasAuthupClient, hasRedis, hasVaultClient, useAuthupClient, useRedis, useVaultClient,
} from '../core';
import { BucketController, BucketFileController } from './controllers';

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
        authup: {
            client: hasAuthupClient() ?
                useAuthupClient() :
                undefined,
            vaultClient: hasVaultClient() ?
                useVaultClient() :
                undefined,
            redisClient: hasRedis() ?
                useRedis() :
                undefined,
            fakeAbilities: useEnv('env') === EnvironmentName.TEST,
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
