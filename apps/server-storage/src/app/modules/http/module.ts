/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { Router } from 'routup';
import { serve } from 'routup/node';
import {
    AuthupClientInjectionKey,
    EnvironmentName,
    LoggerInjectionKey,
    RedisClientInjectionKey,
    createAuthupClientTokenCreator,
} from '@privateaim/server-kit';
import {
    createAuthupTokenVerifier,
    mountErrorMiddleware,
    mountMiddlewares,
} from '@privateaim/server-http-kit';
import type { MiddlewareSwaggerOptions } from '@privateaim/server-http-kit';
import { ConfigInjectionKey } from '../config/constants.ts';
import { createControllers } from './controller.ts';
import type { HTTPServer } from './constants.ts';
import { HTTPInjectionKey } from './constants.ts';

export class HTTPModule implements IModule {
    readonly name = 'http';

    readonly dependencies: string[] = ['config', 'database', 'minio'];

    private instance: HTTPServer | undefined;

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

        const controllers = createControllers(container);

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
            decorators: { controllers },
        });

        mountErrorMiddleware(router, { logger });

        container.register(HTTPInjectionKey.Router, { useValue: router });

        logger.debug('Starting http server...');

        const server = serve(router, {
            port: config.port,
            hostname: '0.0.0.0',
            silent: true,
            gracefulShutdown: false,
        });

        await server.ready();

        this.instance = server;

        if (server.url) {
            logger.debug(`Listening on ${server.url}`);
        }

        container.register(HTTPInjectionKey.Server, { useValue: server });
    }

    async teardown(container: IContainer): Promise<void> {
        if (!this.instance) return;

        container.unregister(HTTPInjectionKey.Server);

        await this.instance.close();
        this.instance = undefined;
    }
}
