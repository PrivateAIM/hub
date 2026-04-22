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
    AuthupClientInjectionKey,
    EnvironmentName,
    LoggerInjectionKey,
    RedisClientInjectionKey,
    RedisPublishClientInjectionKey,
    RedisSubscribeClientInjectionKey,
    createAuthupClientTokenCreator,
} from '@privateaim/server-kit';
import { createAuthupTokenVerifier, mountErrorMiddleware, mountMiddlewares } from '@privateaim/server-http-kit';
import type { MiddlewareSwaggerOptions } from '@privateaim/server-http-kit';
import {
    AnalysisLogController,
    AnalysisNodeLogController,
    RootController,
} from '../../../adapters/http/controllers/index.ts';
import { createSocketServer } from '../../../adapters/socket/server.ts';
import { ConfigInjectionKey } from '../config/constants.ts';
import { TelemetryClientInjectionKey } from '../telemetry-client/constants.ts';
import { createControllers } from './controller.ts';
import { HTTPInjectionKey } from './constants.ts';
import type { HTTPModuleOptions } from './types.ts';

export class HTTPModule implements IModule {
    readonly name = 'http';

    readonly dependencies: string[] = ['config', 'database', 'analysis'];

    private options: HTTPModuleOptions;

    constructor(options: HTTPModuleOptions = {}) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey);
        const logger = container.resolve(LoggerInjectionKey);

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

        const telemetryClientResult = container.tryResolve(TelemetryClientInjectionKey);
        const telemetryClient = telemetryClientResult.success ? telemetryClientResult.data : undefined;

        const authupResult = container.tryResolve(AuthupClientInjectionKey);
        const redisResult = container.tryResolve(RedisClientInjectionKey);

        mountMiddlewares(router, {
            basic: true,
            cors: true,
            prometheus: !isTestEnvironment,
            rateLimit: !isTestEnvironment,
            authorization: {
                authupClient: authupResult.success ?
                    authupResult.data :
                    undefined,
                redisClient: redisResult.success ?
                    redisResult.data :
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
                    redisClient: redisResult.success ? redisResult.data : undefined,
                }),
            },
            swagger,
            decorators: {
                controllers: [
                    // DI-wired instances
                    ...controllers,

                    // Telemetry-coupled (DI-wired instances)
                    new AnalysisLogController({ telemetryClient }),
                    new AnalysisNodeLogController({ telemetryClient }),

                    // Workflows
                    RootController,
                ],
            },
        });

        mountErrorMiddleware(router, { logger });

        container.register(HTTPInjectionKey.Router, { useValue: router });

        if (!this.options.skipServer) {
            logger.debug('Starting http server...');

            const server = new http.Server(createNodeDispatcher(router));

            await new Promise<void>((resolve, reject) => {
                const errorHandler = (err?: null | Error) => {
                    reject(err);
                };

                server.once('error', errorHandler);
                server.once('listening', () => {
                    server.removeListener('error', errorHandler);
                    resolve();
                });

                server.listen(config.port, '0.0.0.0');
            });

            logger.debug(`Listening on 0.0.0.0:${config.port}.`);

            container.register(HTTPInjectionKey.Server, { useValue: server });

            if (this.options.socket) {
                const redisPubResult = container.tryResolve(RedisPublishClientInjectionKey);
                const redisSubResult2 = container.tryResolve(RedisSubscribeClientInjectionKey);
                createSocketServer(server, {
                    config,
                    logger,
                    redisPublishClient: redisPubResult.success ? redisPubResult.data : undefined,
                    redisSubscribeClient: redisSubResult2.success ? redisSubResult2.data : undefined,
                });
            }
        }
    }

    async teardown(container: IContainer): Promise<void> {
        const result = container.tryResolve(HTTPInjectionKey.Server);
        if (result.success) {
            await new Promise<void>((resolve, reject) => {
                result.data.close((error?: Error | null) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });
        }
    }
}
