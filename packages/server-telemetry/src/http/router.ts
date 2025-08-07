/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MiddlewareSwaggerOptions } from '@privateaim/server-http-kit';
import {
    mountErrorMiddleware,
    mountMiddlewares,
} from '@privateaim/server-http-kit';
import {
    isAuthupClientUsable,
    isRedisClientUsable,
    isVaultClientUsable,
    useAuthupClient,
    useRedisClient,
    useVaultClient,
} from '@privateaim/server-kit';
import { Router, coreHandler } from 'routup';
import { EnvironmentName, useEnv } from '../config';
import { EventController } from './controllers';

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
        authup: {
            client: isAuthupClientUsable() ?
                useAuthupClient() :
                undefined,
            vaultClient: isVaultClientUsable() ?
                useVaultClient() :
                undefined,
            redisClient: isRedisClientUsable() ?
                useRedisClient() :
                undefined,
            fakeAbilities: useEnv('env') === EnvironmentName.TEST,
        },
        swagger,
        decorators: {
            controllers: [
                EventController,
            ],
        },
    });

    mountErrorMiddleware(router);

    router.get('/', coreHandler(() => ({
        timestamp: Date.now(),
    })));

    return router;
}
