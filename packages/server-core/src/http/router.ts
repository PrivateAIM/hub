/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    isAuthupClientUsable,
    isRedisClientUsable,
    isVaultClientUsable,
    useAuthupClient,
    useRedisClient,
    useVaultClient,
} from '@privateaim/server-kit';
import { mountErrorMiddleware, mountMiddlewares } from '@privateaim/server-http-kit';
import type { MiddlewareSwaggerOptions } from '@privateaim/server-http-kit';
import { Router } from 'routup';
import { EnvironmentName, useEnv } from '../config';
import { AnalysisBucketEntity } from '../domains';

import { AnalysisController } from './controllers/core/analysis';
import { AnalysisFileController } from './controllers/core/analysis-file';
import { AnalysisLogController } from './controllers/core/analysis-log';
import { AnalysisNodeController } from './controllers/core/analysis-node';
import { MasterImageController } from './controllers/core/master-image';
import { MasterImageGroupController } from './controllers/core/master-image-group';
import { NodeController } from './controllers/core/node';
import { ProposalController } from './controllers/core/project';
import { ProposalStationController } from './controllers/core/project-node';
import { RegistryController } from './controllers/core/registry';
import { RegistryProjectController } from './controllers/core/registry-project';
import { RootController } from './controllers/core/root';
import { ServiceController } from './controllers/special/service';

export function createRouter() : Router {
    const router = new Router();

    const isTestEnvironment = useEnv('env') === EnvironmentName.TEST;

    let swagger : MiddlewareSwaggerOptions | boolean;
    if (!isTestEnvironment) {
        swagger = {
            baseURL: useEnv('publicURL'),
        };
    } else {
        swagger = false;
    }

    mountMiddlewares(router, {
        basic: true,
        cors: true,
        prometheus: !isTestEnvironment,
        rateLimit: !isTestEnvironment,
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
            fakeAbilities: isTestEnvironment,
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
                AnalysisBucketEntity,
                AnalysisFileController,
                AnalysisLogController,
                AnalysisNodeController,

                RootController,

                // Extra
                ServiceController,
            ],
        },
    });

    mountErrorMiddleware(router);

    return router;
}
