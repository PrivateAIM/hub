/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRedisClientUsable, useRedisPublishClient, useRedisSubscribeClient } from '@privateaim/server-kit';
import { createAdapter } from '@socket.io/redis-adapter';
import type { Server as HTTPServer } from 'node:http';
import type { DefaultEventsMap, ServerOptions } from 'socket.io';
import { Server } from 'socket.io';

export function createServer<
    ListenEvents extends Record<string, any> = DefaultEventsMap,
    EmitEvents extends Record<string, any> = ListenEvents,
    ServerSideEvents extends Record<string, any> = DefaultEventsMap,
    SocketData = any,
>(
    httpServer: HTTPServer,
): Server<ListenEvents, EmitEvents, ServerSideEvents, SocketData> {
    let adapter : ServerOptions['adapter'] | undefined;
    if (isRedisClientUsable()) {
        adapter = createAdapter(
            useRedisPublishClient(),
            useRedisSubscribeClient(),
        );
    }

    return new Server<
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
}
