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
import { useLogger } from '@privateaim/server-kit';
import type { Socket, SocketData } from '@privateaim/server-realtime-kit';
import { createAuthupMiddleware } from '@privateaim/server-realtime-kit';
import { has } from 'envix';
import type { Server as HTTPServer } from 'node:http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { useEnv } from '../config';
import type { Config } from '../config';
import { registerControllers } from './register';

interface SocketServerContext {
    httpServer: HTTPServer,
    config: Config
}

export function createSocketServer(context : SocketServerContext) : Server {
    const server = new Server<
    SocketResourcesNamespaceCTSEvents,
    SocketResourcesNamespaceSTCEvents,
    STSEvents,
    SocketData
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
