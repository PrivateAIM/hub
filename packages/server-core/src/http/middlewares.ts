/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { mountAuthupMiddleware } from '@privateaim/server-kit';
import { basic } from '@routup/basic';
import type { Router } from 'routup';
import { EnvironmentName, useEnv } from '../config';
import {
    hasAuthupClient,
    hasRedisClient,
    hasVaultClient,
    useAuthupClient,
    useRedisClient,
    useVaultClient,
} from '../core';
import {
    registerCorsMiddleware,
    registerPrometheusMiddleware,
    registerRateLimiterMiddleware,
    registerSwaggerMiddleware,
} from './middleware';

export function registerMiddlewares(router: Router) {
    registerCorsMiddleware(router);
    router.use(basic());

    if (useEnv('env') !== EnvironmentName.TEST) {
        registerRateLimiterMiddleware(router);
        registerPrometheusMiddleware(router);
        registerSwaggerMiddleware(router);
    }

    mountAuthupMiddleware(router, {
        client: hasAuthupClient() ?
            useAuthupClient() :
            undefined,
        vaultClient: hasVaultClient() ?
            useVaultClient() :
            undefined,
        redisClient: hasRedisClient() ?
            useRedisClient() :
            undefined,
        fakeAbilities: useEnv('env') === EnvironmentName.TEST,
    });
}
