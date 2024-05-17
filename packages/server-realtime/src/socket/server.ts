/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createAuthupMiddleware } from '@privateaim/server-realtime-kit';
import { has } from 'envix';
import type { Server as HTTPServer } from 'node:http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { useEnv } from '../config';
import { registerMessagesNamespace, registerResourcesNamespaces } from './namespaces';
import type { Config } from '../config';

interface SocketServerContext {
    httpServer: HTTPServer,
    config: Config
}

export function createSocketServer(context : SocketServerContext) : Server {
    const server = new Server(context.httpServer, {
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

    registerMessagesNamespace({
        server,
        authupMiddleware,
    });

    registerResourcesNamespaces({
        server,
        authupMiddleware,
    });

    return server;
}
