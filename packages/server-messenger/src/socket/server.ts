/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { UnauthorizedError } from '@ebec/http';
import type { CTSEvents, STCEvents } from '@privateaim/messenger-kit';
import {
    isRedisClientUsable,
    isVaultClientUsable,
    useLogger,
    useRedisClient,
    useRedisPublishClient,
    useRedisSubscribeClient,
    useVaultClient,
} from '@privateaim/server-kit';
import { createAuthupMiddleware } from '@privateaim/server-realtime-kit';
import type { Server as HTTPServer } from 'node:http';
import type { ServerOptions } from 'socket.io';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { useEnv } from '../config';
import { registerControllers } from './register';

export function createSocketServer(httpServer: HTTPServer) : Server {
    let adapter : ServerOptions['adapter'] | undefined;
    if (isRedisClientUsable()) {
        adapter = createAdapter(
            useRedisPublishClient(),
            useRedisSubscribeClient(),
        );
    }

    const server = new Server<
    CTSEvents,
    STCEvents
    >(httpServer, {
        adapter,
        cors: {
            origin(origin, callback) {
                callback(null, true);
            },
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });

    const authupMiddleware = createAuthupMiddleware({
        baseURL: useEnv('authupURL'),
        redis: isRedisClientUsable() ?
            useRedisClient() :
            undefined,
        vault: isVaultClientUsable() ?
            useVaultClient() :
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
