/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import http from 'node:http';
import { Router, createNodeDispatcher } from 'routup';
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
import {
    AnalysisLogController,
    AnalysisNodeLogController,
    RootController,
    ServiceController,
} from '../../../http/controllers/index.ts';
import { ConfigInjectionKey } from '../config/constants.ts';
import { createControllers } from './controller.ts';
import { HTTPInjectionKey } from './constants.ts';
import type { HTTPModuleOptions } from './types.ts';

export class HTTPModule implements IModule {
    readonly name = 'http';

    readonly dependencies: string[] = ['config', 'database'];

    private options: HTTPModuleOptions;

    constructor(options: HTTPModuleOptions = {}) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey);
        const router = new Router();

        const isTestEnvironment = config.env === EnvironmentName.TEST;

        let swagger: MiddlewareSwaggerOptions | boolean;
        if (!isTestEnvironment) {
            swagger = { baseURL: config.publicURL };
        } else {
            swagger = false;
        }

        // Create DI-wired controller instances from container
        const controllers = createControllers(container);

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
                    baseURL: config.authupURL,
                    creator: createAuthupClientTokenCreator({
                        baseURL: config.authupURL,
                        clientId: config.clientId,
                        clientSecret: config.clientSecret,
                        realm: config.realm,
                    }),
                }),
            },
            swagger,
            decorators: {
                controllers: [
                    // DI-wired instances
                    ...controllers,

                    // Telemetry-coupled (keep handler-based for now)
                    AnalysisLogController,
                    AnalysisNodeLogController,

                    // Workflows
                    RootController,
                    ServiceController,
                ],
            },
        });

        mountErrorMiddleware(router);

        container.register(HTTPInjectionKey.Router, { useValue: router });

        if (!this.options.skipServer) {
            const server = new http.Server(createNodeDispatcher(router));
            container.register(HTTPInjectionKey.Server, { useValue: server });
        }
    }

    async teardown(container: IContainer): Promise<void> {
        const result = container.tryResolve(HTTPInjectionKey.Server);
        if (result.success) {
            result.data.close();
        }
    }
}
