/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import type { Server } from 'node:http';
import { App, serve } from 'routup';
import {
    AUTHUP_CLIENT_MODULE_NAME,
    AuthupClientInjectionKey,
    EnvironmentName,
    LoggerInjectionKey,
    MESSAGE_BUS_MODULE_NAME,
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
import { AnalysisLogAccessService } from '../../../core/services/analysis-log-access/index.ts';
import { AnalysisReachService } from '../../../core/services/analysis-reach/index.ts';
import { ConfigInjectionKey } from '../config/constants.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { TelemetryClientInjectionKey } from '../telemetry-client/constants.ts';
import { createControllers } from './controller.ts';
import type { HTTPModuleOptions, HTTPServer  } from './types.ts';
import { HTTPInjectionKey } from './constants.ts';

export class HTTPModule implements IModule {
    readonly name = 'http';

    /**
     * `telemetryClient` is OPTIONAL but declared: this module `tryResolve`s
     * that token while constructing the log controllers, so it must be set up
     * first WHEN PRESENT. Without declaring it, the ordering held only by
     * accident of graph depth (`telemetryClient` depends on `config` alone,
     * while `http` waits on `analysis`) — which would break silently if either
     * module's dependencies changed.
     *
     * `authupClient` is declared OPTIONAL for the same reason: this module
     * `tryResolve`s the Authup client to mount the authorization middleware
     * (HTTP and socket), and that middleware fails CLOSED without one — every
     * route answers 401, every socket is refused, with no startup error.
     *
     * `components` is declared OPTIONAL for the same reason: this module
     * `tryResolve`s its registry dispatcher; without it, registry commands
     * fail and the Harbor webhook controller is not mounted.
     */
    readonly dependencies: (string | ModuleDependency)[] = [
        'config',
        'database',
        'analysis',
        MESSAGE_BUS_MODULE_NAME,
        { name: 'telemetryClient', optional: true },
        { name: AUTHUP_CLIENT_MODULE_NAME, optional: true },
        { name: 'components', optional: true },
    ];

    private options: HTTPModuleOptions;

    private instance: HTTPServer | undefined;

    private socket: ReturnType<typeof createSocketServer> | undefined;

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

        const analysisRepository = container.resolve(DatabaseInjectionKey.AnalysisRepository);
        const analysisNodeRepository = container.resolve(DatabaseInjectionKey.AnalysisNodeRepository);
        const nodeRepository = container.resolve(DatabaseInjectionKey.NodeRepository);
        const analysisLogAccessService = new AnalysisLogAccessService({
            analysisRepository,
            analysisNodeRepository,
            nodeRepository,
            reach: new AnalysisReachService({
                analysisNodeRepository,
                analysisRepository,
                nodeRepository,
            }),
        });

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
                cookiePrefix: config.cookiePrefix,
                tokenVerifier: createAuthupTokenVerifier({
                    baseURL: config.authupURL,
                    creator: createAuthupClientTokenCreator({
                        baseURL: config.authupURL,
                        clientId: config.clientId,
                        clientSecret: config.clientSecret,
                        realm: config.realm,
                    }),
                    clientId: config.clientId,
                    realm: config.realm,
                    redisClient: redisResult.success ? redisResult.data : undefined,
                }),
            },
            swagger,
            decorators: {
                controllers: [
                    // DI-wired instances
                    ...controllers,

                    // Telemetry-coupled (DI-wired instances)
                    new AnalysisLogController({ accessService: analysisLogAccessService, telemetryClient }),
                    new AnalysisNodeLogController({ accessService: analysisLogAccessService, telemetryClient }),

                    // Workflows
                    RootController,
                ],
            },
        });

        mountErrorMiddleware(app, { logger });

        container.register(HTTPInjectionKey.App, { useValue: app });

        if (this.options.skipServer) {
            return;
        }

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

                this.socket = createSocketServer(server.node!.server as Server, {
                    config,
                    authupClient: authupResult.success ? authupResult.data : undefined,
                    logger,
                    redisPublishClient: redisPubResult.success ? redisPubResult.data : undefined,
                    redisSubscribeClient: redisSubResult2.success ? redisSubResult2.data : undefined,
                });
            }
        } catch (e) {
            await this.socket?.close().catch(() => undefined);
            this.socket = undefined;
            await server.close().catch(() => undefined);
            this.instance = undefined;

            throw e;
        }
    }

    async teardown(container: IContainer): Promise<void> {
        container.unregister(HTTPInjectionKey.App);

        if (!this.instance) {
            return;
        }

        container.unregister(HTTPInjectionKey.Server);

        try {
            await this.socket?.close();
        } finally {
            this.socket = undefined;
            await this.instance.close();
            this.instance = undefined;
        }
    }
}
