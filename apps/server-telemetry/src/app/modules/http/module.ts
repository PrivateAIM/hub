/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { App, serve } from 'routup';
import {
    AUTHUP_CLIENT_MODULE_NAME,
    AuthupClientInjectionKey,
    EnvironmentName,
    Health,
    HealthInjectionKey,
    LoggerInjectionKey,
    RedisClientInjectionKey,
    createDatabaseHealthCheck,
    createHealthLogObserver,
} from '@privateaim/server-kit';
import {
    createAuthupTokenVerifier,
    mountErrorMiddleware,
    mountHealthRoutes,
    mountMiddlewares,
} from '@privateaim/server-http-kit';
import type { MiddlewareSwaggerOptions } from '@privateaim/server-http-kit';
import { ConfigInjectionKey } from '../config/constants.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { createControllers } from './controller.ts';
import type { HTTPServer } from './types.ts';
import { HTTPInjectionKey } from './constants.ts';

export class HTTPModule implements IModule {
    readonly name = 'http';

    /**
     * `authupClient` is OPTIONAL but declared: this module `tryResolve`s the Authup
     * client to mount the authorization middleware (HTTP and socket), and that
     * middleware fails CLOSED without one - every route answers 401, every
     * socket is refused. Undeclared, `authupClient` was set up first only by
     * accident of graph depth, so a dependency change elsewhere could have
     * flipped the order and locked every caller out without a startup error.
     */
    readonly dependencies: (string | ModuleDependency)[] = [
        'config',
        'database',
        'victoriaLogs',
        { name: AUTHUP_CLIENT_MODULE_NAME, optional: true },
    ];

    private instance: HTTPServer | undefined;

    private health: Health | undefined;

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey);
        const logger = container.resolve(LoggerInjectionKey);

        // Every hop by default; TRUST_PROXY narrows whose X-Forwarded-For
        // entries name the client (audit IP, rate-limit key).
        const app = new App({ options: { trustProxy: config.trustProxy ?? true } });

        // Ahead of every middleware: probes are neither authenticated, rate
        // limited nor counted. Readiness waits on the database (1 s bound).
        this.health = new Health({
            readiness: [createDatabaseHealthCheck(container.resolve(DatabaseInjectionKey.DataSource))],
            onReadinessChange: createHealthLogObserver(logger),
        });
        container.register(HealthInjectionKey, { useValue: this.health });
        mountHealthRoutes(app, this.health);

        const isTestEnvironment = config.env === EnvironmentName.TEST;

        let swagger: MiddlewareSwaggerOptions | boolean;

        if (!isTestEnvironment) {
            swagger = { baseURL: config.publicURL };
        } else {
            swagger = false;
        }

        const controllers = createControllers(container);

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
                    client: {
                        id: config.clientId,
                        secret: config.clientSecret,
                        realm: config.realm,
                    },
                    redisClient: redisResult.success ? redisResult.data : undefined,
                }),
            },
            swagger,
            decorators: { controllers },
        });

        mountErrorMiddleware(app, { logger });

        container.register(HTTPInjectionKey.App, { useValue: app });

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
        } catch (e) {
            await server.close().catch(() => undefined);

            throw e;
        }
    }

    async onReady(): Promise<void> {
        // Every module finished its setup: both probes may pass from now on.
        this.health?.markStarted();
    }

    async teardown(container: IContainer): Promise<void> {
        container.unregister(HTTPInjectionKey.App);
        container.unregister(HealthInjectionKey);
        this.health = undefined;

        if (!this.instance) {
            return;
        }

        container.unregister(HTTPInjectionKey.Server);

        await this.instance.close();
        this.instance = undefined;
    }
}
