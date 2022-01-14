/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { ForbiddenError, UnauthorizedError } from '@typescript-error/http';
import { MASTER_REALM_ID } from '@typescript-auth/domains';
import { useLogger } from '../../modules/log';
import { useAuthMiddleware } from './middleware/auth';
import { registerSocketHandlers, registerSocketNamespaceHandlers } from './handlers';
import { Environment } from '../../env';
import { Config } from '../../config';
import { SocketInterface, SocketServerInterface } from './type';

interface SocketServerContext {
    httpServer: HTTPServer,
    env: Environment,
    config: Config
}

export function createSocketServer(context : SocketServerContext) : Server {
    useLogger().debug('setup socket server...', { service: 'socket' });

    const server : SocketServerInterface = new Server(context.httpServer, {
        adapter: createAdapter(context.config.redisPub, context.config.redisSub),
        cors: {
            origin(origin, callback) {
                callback(null, true);
            },
            credentials: true,
        },
        transports: ['websocket', 'polling'],
        // ...
    });

    // receive user
    server.use(useAuthMiddleware(context.config));

    // register handlers
    registerSocketHandlers(server);

    // build & register realm workspaces
    const realmWorkspaces = server.of(/^\/realm#[a-z0-9]+$/);
    realmWorkspaces.use(useAuthMiddleware(context.config));
    realmWorkspaces.use((socket: SocketInterface, next) => {
        if (!socket.data.userId) {
            next(new UnauthorizedError());
            return;
        }

        const matches = socket.nsp.name.match(/^\/realm#([a-z0-9]+)$/);

        if (
            matches[1] === socket.data.user.realm_id ||
            socket.data.user.realm_id === MASTER_REALM_ID
        ) {
            next();
        } else {
            next(new ForbiddenError());
        }
    });

    registerSocketNamespaceHandlers(realmWorkspaces);

    return server;
}
