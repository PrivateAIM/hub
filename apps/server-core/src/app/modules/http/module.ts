/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import type { Server } from 'node:http';
import { App, serve } from 'routup';
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
import type { HTTPServer } from './constants.ts';
import { HTTPInjectionKey } from './constants.ts';
import type { HTTPModuleOptions } from './types.ts';

export class HTTPModule implements IModule {
    readonly name = 'http';

    readonly dependencies: string[] = ['config', 'database', 'analysis'];

    private options: HTTPModuleOptions;

    private instance: HTTPServer | undefined;

    constructor(options: HTTPModuleOptions = {}) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey);
        const logger = container.resolve(LoggerInjectionKey);

        const app = new App();

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

        mountMiddlewares(app, {
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

        mountErrorMiddleware(app, { logger });

        container.register(HTTPInjectionKey.App, { useValue: app });

        if (!this.options.skipServer) {
            logger.debug('Starting http server...');

            const server = serve(app, {
                port: config.port,
                hostname: '0.0.0.0',
                silent: true,
                gracefulShutdown: false,
            });

            try {
                await server.ready();

                this.instance = server;

                if (server.url) {
                    logger.debug(`Listening on ${server.url}`);
                }

                container.register(HTTPInjectionKey.Server, { useValue: server });

                if (this.options.socket) {
                    const redisPubResult = container.tryResolve(RedisPublishClientInjectionKey);
                    const redisSubResult2 = container.tryResolve(RedisSubscribeClientInjectionKey);
                    createSocketServer(server.node!.server as Server, {
                        config,
                        logger,
                        redisPublishClient: redisPubResult.success ? redisPubResult.data : undefined,
                        redisSubscribeClient: redisSubResult2.success ? redisSubResult2.data : undefined,
                    });
                }
            } catch (e) {
                await server.close().catch(() => undefined);
                throw e;
            }
        }
    }

    async teardown(container: IContainer): Promise<void> {
        container.unregister(HTTPInjectionKey.App);

        if (!this.instance) return;

        container.unregister(HTTPInjectionKey.Server);

        await this.instance.close();
        this.instance = undefined;
    }
}
