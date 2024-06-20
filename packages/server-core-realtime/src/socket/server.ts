/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { REALM_MASTER_NAME } from '@authup/core-kit';
import { ForbiddenError, UnauthorizedError } from '@ebec/http';
import type {
    STSEvents,
    SocketResourcesNamespaceCTSEvents,
    SocketResourcesNamespaceSTCEvents,
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
    }

    const server = new Server<
    SocketResourcesNamespaceCTSEvents,
    SocketResourcesNamespaceSTCEvents,
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
    }
    if (isVaultClientUsable()) {
        authupMiddlewareOptions.vault = useVaultClient();
    }

    const authupMiddleware = createAuthupMiddleware(authupMiddlewareOptions);

    const nsp = server.of(/^\/resources(?:#[a-z0-9A-Z-_]+)?$/);
    nsp.use((socket, next) => {
        useLogger().info(`${socket.nsp.name}: ${socket.id} connected.`);
        next();
    });
    nsp.use(authupMiddleware);

    nsp.use((socket: Socket, next) => {
        if (!socket.data.userId && !socket.data.robotId) {
            useLogger().error('Socket is not authenticated.');

            next(new UnauthorizedError());
            return;
        }

        const matches = socket.nsp.name.match(/^\/resources(?:#([a-z0-9A-Z-_]+))?$/);
        if (typeof matches[1] === 'undefined') {
            if (socket.data.realmName !== REALM_MASTER_NAME) {
                useLogger().error(`Realm ${socket.data.realmName} is not permitted for the global scope.`);
                next(new ForbiddenError());

                return;
            }
        } else {
            [, socket.data.namespaceId] = matches;

            if (matches[1] !== socket.data.realmId && socket.data.realmName !== REALM_MASTER_NAME) {
                useLogger().error(`Realm ${socket.data.realmName} is not permitted for the realm ${matches[1]}.`);
                next(new ForbiddenError());
                return;
            }
        }

        useLogger().debug(`Socket ${socket.id} connected.`);

        next();
    });

    registerControllers(nsp);

    return server;
}
