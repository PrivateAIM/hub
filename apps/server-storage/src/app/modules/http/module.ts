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
    useLogger,
    useRedisClient,
} from '@privateaim/server-kit';
import {
    createAuthupTokenVerifier,
    mountErrorMiddleware,
    mountMiddlewares,
} from '@privateaim/server-http-kit';
import type { MiddlewareSwaggerOptions } from '@privateaim/server-http-kit';
import { ConfigInjectionKey } from '../config/constants.ts';
import { createControllers } from './controller.ts';
import { HTTPInjectionKey } from './constants.ts';

export class HTTPModule implements IModule {
    readonly name = 'http';

    readonly dependencies: string[] = ['config', 'database', 'minio'];

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey);
        const logger = useLogger();

        const router = new Router();

        const isTestEnvironment = config.env === EnvironmentName.TEST;

        let swagger: MiddlewareSwaggerOptions | boolean;
        if (!isTestEnvironment) {
            swagger = { baseURL: config.publicURL };
        } else {
            swagger = false;
        }

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
            decorators: { controllers },
        });

        mountErrorMiddleware(router);

        container.register(HTTPInjectionKey.Router, { useValue: router });

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
