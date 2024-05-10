/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { has } from 'envix';
import type { Server as HTTPServer } from 'node:http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type { TokenCreatorOptions } from '@authup/core-http-kit';
import {
    AbilityManager, OAuth2SubKind,
} from '@authup/kit';
import type { TokenVerifierCacheOptions } from '@authup/server-core-plugin-kit';
import { createMiddleware } from '@authup/server-core-plugin-socket-io';
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

    let cache : TokenVerifierCacheOptions | undefined;
    if (has('REDIS_CONNECTION_STRING')) {
        cache = {
            type: 'redis',
            client: context.config.redisDatabase,
        };
    }

    let creator : TokenCreatorOptions | undefined;
    if (has('VAULT_CONNECTION_STRING')) {
        creator = {
            type: 'robotInVault',
            name: 'system',
            vault: useEnv('vaultConnectionString'),
        };
    } else {
        creator = {
            type: 'user',
            name: 'admin',
            password: 'start123',
        };
    }

    const authMiddleware = createMiddleware({
        tokenVerifier: {
            baseURL: useEnv('authupApiURL'),
            creator,
            cache,
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
