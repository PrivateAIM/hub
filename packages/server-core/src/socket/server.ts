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
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import type { Server as HTTPServer } from 'node:http';
import type { ServerOptions } from 'socket.io';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { useEnv } from '../config';
import { registerSocketControllers } from './register';

type Adapter = ServerOptions['adapter'];

export function createSocketServer(
    httpServer: HTTPServer,
) : Server {
    let adapter : Adapter | undefined;

    if (isRedisClientUsable()) {
        adapter = createAdapter(
            useRedisPublishClient(),
            useRedisSubscribeClient(),
        );
    } else {
        useLogger().debug('Redis is not configured and can not be used as an adapter.');
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
        baseURL: useEnv('authupURL'),
    };
    if (isRedisClientUsable()) {
        authupMiddlewareOptions.redis = useRedisClient();
    }

    if (isVaultClientUsable()) {
        authupMiddlewareOptions.vault = useVaultClient();
    }

    const authupMiddleware = createAuthupMiddleware(authupMiddlewareOptions);

    server.on('error', (err) => {
        useLogger().error(err, {
            [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
        });
    });

    const pattern = /^\/resources(?::[a-z0-9A-Z-_]+)?$/;
    const nsp = server.of(pattern);
    nsp.use((socket, next) => {
        useLogger().debug(`Socket/${socket.id}: Connected.`, {
            namespace: socket.nsp.name,
            [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
        });

        socket.on('disconnect', () => {
            useLogger().debug(`Socket/${socket.id}: Disconnected.`, {
                namespace: socket.nsp.name,
                [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
            });
        });

        next();
    });

    nsp.use(authupMiddleware);

    nsp.use((socket: Socket, next) => {
        if (socket.data.userId) {
            useLogger().info(`Socket/${socket.id}: User connected.`, {
                [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                actor_type: 'user',
                actor_id: socket.data.userId,
            });
        } else if (socket.data.robotId) {
            useLogger().info(`Socket/${socket.id}: Robot connected.`, {
                [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                actor_type: 'robot',
                actor_id: socket.data.robotId,
            });
        } else if (socket.data.clientId) {
            useLogger().info(`Socket/${socket.id}: Client connected.`, {
                [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                actor_type: 'client',
                actor_id: socket.data.clientId,
            });
        } else {
            useLogger().warn(`Socket/${socket.id}: Not authenticated.`, {
                [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
            });

            next(new UnauthorizedError());
            return;
        }

        const matches = socket.nsp.name.match(pattern);
        if (typeof matches[1] === 'undefined') {
            if (socket.data.realmName !== REALM_MASTER_NAME) {
                useLogger()
                    .error(`Socket/${socket.id}: Realm ${socket.data.realmName} is not permitted for the global scope.`, {
                        [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                    });
                next(new ForbiddenError());

                return;
            }
        } else {
            [, socket.data.namespaceId] = matches;

            if (matches[1] !== socket.data.realmId && socket.data.realmName !== REALM_MASTER_NAME) {
                useLogger()
                    .error(`Socket/${socket.id}: Realm ${socket.data.realmName} is not permitted for the realm ${matches[1]}.`, {
                        [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                    });

                next(new ForbiddenError());
                return;
            }
        }

        socket.on('disconnect', () => {
            if (socket.data.userId) {
                useLogger().info(`Socket/${socket.id}: User disconnected`, {
                    [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                    actor_type: 'user',
                    actor_id: socket.data.userId,
                });
            } else if (socket.data.robotId) {
                useLogger().info(`Socket/${socket.id}: Robot disconnected`, {
                    [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                    actor_type: 'robot',
                    actor_id: socket.data.userId,
                });
            } else if (socket.data.clientId) {
                useLogger().info(`Socket/${socket.id}: Client disconnected`, {
                    [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                    actor_type: 'client',
                    actor_id: socket.data.clientId,
                });
            }
        });

        next();
    });

    nsp.adapter.on('create-room', (room) => {
        useLogger().info(`Room ${room} was created.`, {
            [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
        });
    });
    nsp.adapter.on('delete-room', (room) => {
        useLogger().info(`Room ${room} was deleted.`, {
            [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
        });
    });

    registerSocketControllers(nsp);

    return server;
}
