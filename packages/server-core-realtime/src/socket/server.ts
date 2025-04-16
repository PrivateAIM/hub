/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { REALM_MASTER_NAME } from '@authup/core-kit';
import { ForbiddenError, UnauthorizedError } from '@ebec/http';
import type {
    CTSEvents,
    STCEvents,
    STSEvents,
} from '@privateaim/core-realtime-kit';
import {
    isRedisClientUsable,
    isVaultClientUsable,
    useLogger,
    useRedisClient,
    useRedisPublishClient,
    useRedisSubscribeClient,
    useVaultClient,
} from '@privateaim/server-kit';
import type { AuthupMiddlewareRegistrationOptions, Socket, SocketData } from '@privateaim/server-realtime-kit';
import { createAuthupMiddleware } from '@privateaim/server-realtime-kit';
import type { Server as HTTPServer } from 'node:http';
import type { ServerOptions } from 'socket.io';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { registerControllers } from './register';

type Adapter = ServerOptions['adapter'];

export type SocketServerCreateOptions = {
    authupURL?: string
};

export function createSocketServer(httpServer: HTTPServer, options: SocketServerCreateOptions) : Server {
    let adapter : Adapter | undefined;

    if (isRedisClientUsable()) {
        adapter = createAdapter(
            useRedisPublishClient(),
            useRedisSubscribeClient(),
        );
    } else {
        useLogger().warn('[socket] Redis is not configured and can not be used as an adapter.');
    }

    const server = new Server<
    CTSEvents,
    STCEvents,
    STSEvents,
    SocketData
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

    const authupMiddlewareOptions : AuthupMiddlewareRegistrationOptions = {
        baseURL: options.authupURL,
    };
    if (isRedisClientUsable()) {
        authupMiddlewareOptions.redis = useRedisClient();
    } else {
        useLogger().warn('[socket] Redis is not configured and can not be used for the authup middleware.');
    }

    if (isVaultClientUsable()) {
        authupMiddlewareOptions.vault = useVaultClient();
    } else {
        useLogger().warn('[socket] Redis is not configured and can not be used for the authup middleware.');
    }

    const authupMiddleware = createAuthupMiddleware(authupMiddlewareOptions);

    const pattern = /^\/resources(?::[a-z0-9A-Z-_]+)?$/;
    const nsp = server.of(pattern);
    nsp.use((socket, next) => {
        useLogger().info(`[socket] ${socket.nsp.name}: ${socket.id} connected.`);

        socket.on('disconnect', () => {
            useLogger().info(`[socket] ${socket.nsp.name}: Socket disconnected.`, { socketId: socket.id });
        });

        next();
    });

    nsp.use(authupMiddleware);

    nsp.use((socket: Socket, next) => {
        if (socket.data.userId) {
            useLogger().info(`[socket] ${socket.nsp.name}: User connected.`, { userId: socket.data.userId, socketId: socket.id });
        } else if (socket.data.robotId) {
            useLogger().info(`[socket] ${socket.nsp.name}: Robot connected.`, { robotId: socket.data.robotId, socketId: socket.id });
        } else {
            useLogger().error(`${socket.nsp.name}: Socket is not authenticated.`, { socketId: socket.id });
            next(new UnauthorizedError());
            return;
        }

        const matches = socket.nsp.name.match(pattern);
        if (typeof matches[1] === 'undefined') {
            if (socket.data.realmName !== REALM_MASTER_NAME) {
                useLogger().error(`[socket] Realm ${socket.data.realmName} is not permitted for the global scope.`);
                next(new ForbiddenError());

                return;
            }
        } else {
            [, socket.data.namespaceId] = matches;

            if (matches[1] !== socket.data.realmId && socket.data.realmName !== REALM_MASTER_NAME) {
                useLogger().error(`[socket] Realm ${socket.data.realmName} is not permitted for the realm ${matches[1]}.`);
                next(new ForbiddenError());
                return;
            }
        }

        socket.on('disconnect', () => {
            if (socket.data.userId) {
                useLogger().info('[socket]User disconnected', { userId: socket.data.userId, socketId: socket.id });
            } else if (socket.data.robotId) {
                useLogger().info('[socket] Robot disconnected', { robotId: socket.data.robotId, socketId: socket.id });
            }
        });

        next();
    });

    nsp.adapter.on('create-room', (room) => {
        useLogger().info(`[socket] room ${room} was created`);
    });
    nsp.adapter.on('delete-room', (room) => {
        useLogger().info(`[socket] room ${room} was deleted`);
    });

    registerControllers(nsp);

    return server;
}
