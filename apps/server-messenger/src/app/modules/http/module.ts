/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import type { Server } from 'node:http';
import { Router, defineCoreHandler } from 'routup';
import { serve } from 'routup/node';
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
import type { HTTPServer } from './constants.ts';
import { HTTPInjectionKey } from './constants.ts';

export class HTTPModule implements IModule {
    readonly name = 'http';

    readonly dependencies: string[] = ['config'];

    private instance: HTTPServer | undefined;

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey);
        const logger = container.resolve(LoggerInjectionKey);

        const router = new Router();

        router.get('/', defineCoreHandler(() => ({ timestamp: Date.now() })));

        mountMiddlewares(router, {
            basic: true,
            cors: true,
            prometheus: true,
            rateLimit: true,
        });

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

        // Socket.io server
        const redisPublishResult = container.tryResolve(RedisPublishClientInjectionKey);
        const redisSubscribeResult = container.tryResolve(RedisSubscribeClientInjectionKey);

        const socketServer = createSocketServer(server.node!.server as Server, {
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

        if (!this.instance) return;

        container.unregister(HTTPInjectionKey.Server);

        await this.instance.close();
        this.instance = undefined;
    }
}
