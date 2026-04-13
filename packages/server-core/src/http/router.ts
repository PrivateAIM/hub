/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    EnvironmentName,
    createAuthupClientTokenCreator,
    isAuthupClientUsable,
    isRedisClientUsable,
    useAuthupClient,
    useRedisClient,
} from '@privateaim/server-kit';
import { createAuthupTokenVerifier, mountErrorMiddleware, mountMiddlewares } from '@privateaim/server-http-kit';
import type { MiddlewareSwaggerOptions } from '@privateaim/server-http-kit';
import { Router } from 'routup';
import { useEnv } from '../config/index.ts';
import {
    AnalysisBucketController,
    AnalysisBucketFileController,
    AnalysisController,
    AnalysisLogController,
    AnalysisNodeController,
    AnalysisNodeEventController,
    AnalysisNodeLogController,
    AnalysisPermissionController,
    MasterImageController,
    MasterImageGroupController,
    NodeController,
    ProposalController,
    ProposalStationController,
    RegistryController,
    RegistryProjectController,
    RootController,
    ServiceController,
} from './controllers/index.ts';

export function createRouter() : Router {
    const router = new Router();

    const isTestEnvironment = useEnv('env') === EnvironmentName.TEST;

    let swagger : MiddlewareSwaggerOptions | boolean;
    if (!isTestEnvironment) {
        swagger = { baseURL: useEnv('publicURL') };
    } else {
        swagger = false;
    }

    mountMiddlewares(router, {
        basic: true,
        cors: true,
        prometheus: !isTestEnvironment,
        rateLimit: !isTestEnvironment,
        authorization: {
            authupClient: isAuthupClientUsable() ?
                useAuthupClient() :
                undefined,
            redisClient: isRedisClientUsable() ?
                useRedisClient() :
                undefined,
            dryRun: isTestEnvironment,
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
                // Core
                MasterImageController,
                MasterImageGroupController,
                ProposalController,
                ProposalStationController,
                RegistryController,
                RegistryProjectController,
                NodeController,
                AnalysisController,
                AnalysisBucketController,
                AnalysisBucketFileController,
                AnalysisLogController,
                AnalysisNodeController,
                AnalysisNodeEventController,
                AnalysisNodeLogController,
                AnalysisPermissionController,

                // Workflows
                RootController,
                ServiceController,
            ],
        },
    });

    mountErrorMiddleware(router);

    return router;
}
