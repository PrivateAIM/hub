/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Server as HTTPServer } from 'node:http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import {
    AbilityManager, OAuth2SubKind, ROBOT_SYSTEM_NAME,
} from '@authup/core';
import { createSocketMiddleware } from '@authup/server-adapter';
import { useEnv } from '../config';
import { registerMessagesNamespace, registerResourcesNamespaces } from './namespaces';
import type { SocketBase } from './types';
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
        // ...
    });

    const authMiddleware = createSocketMiddleware({
        tokenVerifier: {
            baseURL: useEnv('authupApiURL'),
            creator: {
                type: 'robotInVault',
                name: ROBOT_SYSTEM_NAME,
                vault: useEnv('vaultConnectionString'),
            },
            cache: {
                type: 'redis',
                client: context.config.redisDatabase,
            },
        },
        tokenVerifierHandler: (socket: SocketBase, data) => {
            switch (data.sub_kind) {
                case OAuth2SubKind.USER: {
                    socket.data.userId = data.sub;
                    break;
                }
                case OAuth2SubKind.ROBOT: {
                    socket.data.robotId = data.sub;
                    break;
                }
            }

            socket.data.realmId = data.realm_id;
            socket.data.realmName = data.realm_name;
            socket.data.ability = new AbilityManager(data.permissions);
        },
    });

    registerMessagesNamespace({
        server,
        authMiddleware,
    });

    registerResourcesNamespaces({
        server,
        authMiddleware,
    });

    return server;
}
