/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { REALM_MASTER_NAME } from '@authup/core-kit';
import { ForbiddenError } from '@ebec/http';
import type {
    CTSEvents,
    STCEvents,
    STSEvents,
} from '@privateaim/core-realtime-kit';
import {
    useLogger,
} from '@privateaim/server-kit';
import type { Socket, SocketData } from '@privateaim/server-realtime-kit';
import {
    createServer,
    mountAuthupMiddleware,
    mountLoggingMiddleware,
} from '@privateaim/server-realtime-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import type { Server as HTTPServer } from 'node:http';
import type { Server } from 'socket.io';
import { registerSocketControllers } from './register.ts';
import { useEnv } from '../config/index.ts';

export function createSocketServer(
    httpServer: HTTPServer,
) : Server {
    const server = createServer<
    CTSEvents,
    STCEvents,
    STSEvents,
    SocketData
    >(httpServer);

    const pattern = /^\/resources(?:\/[a-z0-9A-Z-_]+)?$/;
    const nsp = server.of(pattern);

    mountLoggingMiddleware(nsp);

    mountAuthupMiddleware(nsp, {
        baseURL: useEnv('authupURL'),
    });

    nsp.use((socket: Socket, next) => {
        const matches = socket.nsp.name.match(pattern);
        if (typeof matches[1] === 'undefined') {
            if (socket.data.realmName !== REALM_MASTER_NAME) {
                useLogger()
                    .error({
                        message: `Socket/${socket.id}: Realm ${socket.data.realmName} is not permitted for the global scope.`,
                        [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                    });
                next(new ForbiddenError());

                return;
            }
        } else {
            [, socket.data.namespaceId] = matches;

            if (
                matches[1] !== socket.data.realmId &&
                socket.data.realmName !== REALM_MASTER_NAME
            ) {
                useLogger()
                    .error({
                        message: `Socket/${socket.id}: Realm ${socket.data.realmName} is not permitted for the realm ${matches[1]}.`,
                        [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                    });

                next(new ForbiddenError());
                return;
            }
        }

        next();
    });

    registerSocketControllers(nsp);

    return server;
}
