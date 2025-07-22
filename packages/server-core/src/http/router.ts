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

import { AnalysisController } from './controllers/analysis';
import { AnalysisBucketController } from './controllers/analysis-bucket';
import { AnalysisBucketFileController } from './controllers/analysis-bucket-file';
import { AnalysisLogController } from './controllers/analysis-log';
import { AnalysisNodeController } from './controllers/analysis-node';
import { AnalysisNodeLogController } from './controllers/analysis-node-log';
import { AnalysisPermissionController } from './controllers/analysis-permission';
import { MasterImageController } from './controllers/master-image';
import { MasterImageEventLogController } from './controllers/master-image-event';
import { MasterImageGroupController } from './controllers/master-image-group';
import { NodeController } from './controllers/node';
import { ProposalController } from './controllers/project';
import { ProposalStationController } from './controllers/project-node';
import { RegistryController } from './controllers/registry';
import { RegistryProjectController } from './controllers/registry-project';
import { RootController } from './controllers/root';
import { ServiceController } from './controllers/service';
import { AnalysisNodeEventController } from './controllers/analysis-node-event';

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
                MasterImageEventLogController,
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

                RootController,

                // Extra
                ServiceController,
            ],
        },
    });

    mountErrorMiddleware(router);

    return router;
}
