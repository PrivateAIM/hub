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
        useLogger().info(`${socket.nsp.name}: Socket connected.`, { socketId: socket.id });

        socket.on('disconnect', () => {
            useLogger().info(`${socket.nsp.name}: Socket disconnected.`, { socketId: socket.id });
        });

        next();
    });

    server.use(authupMiddleware);

    server.use((socket, next) => {
        if (socket.data.userId) {
            useLogger().info(`${socket.nsp.name}: User connected.`, { userId: socket.data.userId, socketId: socket.id });
        } else if (socket.data.robotId) {
            useLogger().info(`${socket.nsp.name}: Robot connected.`, { robotId: socket.data.robotId, socketId: socket.id });
        } else {
            useLogger().error(`${socket.nsp.name}: Socket is not authenticated.`, { socketId: socket.id });
            next(new UnauthorizedError());
            return;
        }

        socket.on('disconnect', () => {
            if (socket.data.userId) {
                useLogger().info('User disconnected', { userId: socket.data.userId, socketId: socket.id });
            } else if (socket.data.robotId) {
                useLogger().info('Robot disconnected', { robotId: socket.data.robotId, socketId: socket.id });
            }
        });

        next();
    });

    registerControllers(server);

    return server;
}
