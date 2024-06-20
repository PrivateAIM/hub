/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { UnauthorizedError } from '@ebec/http';
import { useLogger } from '@privateaim/server-kit';
import { createAuthupMiddleware } from '@privateaim/server-realtime-kit';
import { has } from 'envix';
import type { Server as HTTPServer } from 'node:http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type {
    CTSConnectionEvents,
    CTSMessagingEvents,
    STCConnectionEvents,
    STCMessagingEvents,
} from './controllers';
import { useEnv } from '../config';
import type { Config } from '../config';
import { registerControllers } from './register';

interface SocketServerContext {
    httpServer: HTTPServer,
    config: Config
}

export function createSocketServer(context : SocketServerContext) : Server {
    const server = new Server<
    CTSMessagingEvents & CTSConnectionEvents,
    STCMessagingEvents & STCConnectionEvents
    >(context.httpServer, {
        adapter: createAdapter(context.config.redisPub, context.config.redisSub) as any,
        cors: {
            origin(origin, callback) {
                callback(null, true);
            },
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });

    const authupMiddleware = createAuthupMiddleware({
        baseURL: useEnv('authupApiURL'),
        redis: has('REDIS_CONNECTION_STRING') ?
            context.config.redisDatabase :
            undefined,
        vault: has('VAULT_CONNECTION_STRING') ?
            useEnv('vaultConnectionString') :
            undefined,
    });

    server.use((socket, next) => {
        useLogger().info(`${socket.nsp.name}: ${socket.id} connected.`);
        next();
    });
    server.use(authupMiddleware);
    server.use((socket, next) => {
        if (!socket.data.userId && !socket.data.robotId) {
            useLogger().error('Socket is not authenticated.');

            next(new UnauthorizedError());
        }

        next();
    });

    registerControllers(server);

    return server;
}
