/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { createAdapter } from '@socket.io/redis-adapter';
import type { Server as HTTPServer } from 'node:http';
import type { Client as RedisClient } from 'redis-extension';
import type { DefaultEventsMap, ServerOptions } from 'socket.io';
import { Server } from 'socket.io';

type SocketServerOptions = {
    redisPublishClient?: RedisClient,
    redisSubscribeClient?: RedisClient,
    logger?: Logger,
};

export function createServer<
    ListenEvents extends Record<string, any> = DefaultEventsMap,
    EmitEvents extends Record<string, any> = ListenEvents,
    ServerSideEvents extends Record<string, any> = DefaultEventsMap,
    SocketData = any,
>(
    httpServer: HTTPServer,
    options: SocketServerOptions = {},
): Server<ListenEvents, EmitEvents, ServerSideEvents, SocketData> {
    let adapter : ServerOptions['adapter'] | undefined;
    const hasRedisPublishClient = !!options.redisPublishClient;
    const hasRedisSubscribeClient = !!options.redisSubscribeClient;

    if (hasRedisPublishClient !== hasRedisSubscribeClient) {
        options.logger?.warn('Socket.IO Redis adapter requires both publish and subscribe clients.');
    } else if (options.redisPublishClient && options.redisSubscribeClient) {
        adapter = createAdapter(
            options.redisPublishClient,
            options.redisSubscribeClient,
        );
    }

    const server = new Server<
        ListenEvents,
        EmitEvents,
        ServerSideEvents,
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

    if (options.logger) {
        const { logger } = options;
        server.engine.on('connection_error', (err) => {
            logger.error({
                message: err.message,
                code: err.code,
                [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
            });
        });
    }

    return server;
}
