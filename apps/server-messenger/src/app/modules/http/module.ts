/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import http from 'node:http';
import { Router, coreHandler, createNodeDispatcher } from 'routup';
import {
    LoggerInjectionKey,
    RedisPublishClientInjectionKey,
    RedisSubscribeClientInjectionKey,
    createAuthupClientTokenCreator,
} from '@privateaim/server-kit';
import { createAuthupTokenVerifier, mountMiddlewares } from '@privateaim/server-http-kit';
import {
    createServer as createSocketServer,
    mountAuthorizationMiddleware,
    mountLoggingMiddleware,
} from '@privateaim/server-realtime-kit';
import { ConfigInjectionKey } from '../config/constants.ts';
import { registerControllers } from '../../../adapters/socket/register.ts';
import { HTTPInjectionKey } from './constants.ts';

export class HTTPModule implements IModule {
    readonly name = 'http';

    readonly dependencies: string[] = ['config'];

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey);
        const logger = container.resolve(LoggerInjectionKey);

        const router = new Router();

        router.get('/', coreHandler(() => ({ timestamp: Date.now() })));

        mountMiddlewares(router, {
            basic: true,
            cors: true,
            prometheus: true,
            rateLimit: true,
        });

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

        // Socket.io server
        const redisPublishResult = container.tryResolve(RedisPublishClientInjectionKey);
        const redisSubscribeResult = container.tryResolve(RedisSubscribeClientInjectionKey);

        const socketServer = createSocketServer(server, {
            redisPublishClient: redisPublishResult.success ? redisPublishResult.data : undefined,
            redisSubscribeClient: redisSubscribeResult.success ? redisSubscribeResult.data : undefined,
            logger,
        });

        mountLoggingMiddleware(socketServer, { logger });

        mountAuthorizationMiddleware(socketServer, {
            baseURL: config.authupURL,
            tokenVerifier: createAuthupTokenVerifier({
                baseURL: config.authupURL,
                creator: createAuthupClientTokenCreator({
                    baseURL: config.authupURL,
                    clientId: config.clientId,
                    clientSecret: config.clientSecret,
                    realm: config.realm,
                }),
                redisClient: redisPublishResult.success ? redisPublishResult.data : undefined,
            }),
            logger,
        });

        registerControllers(socketServer, { logger });

        logger.debug(`Socket.io server mounted on path: ${socketServer.path()}`);

        container.register(HTTPInjectionKey.SocketServer, { useValue: socketServer });
    }

    async teardown(container: IContainer): Promise<void> {
        const socketResult = container.tryResolve(HTTPInjectionKey.SocketServer);
        if (socketResult.success) {
            await socketResult.data.close();
        }

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
