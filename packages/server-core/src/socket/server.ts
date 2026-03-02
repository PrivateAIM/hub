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
import { createAuthupTokenVerifier } from '@privateaim/server-http-kit';
import {
    createAuthupClientTokenCreator,
    useLogger,
} from '@privateaim/server-kit';
import type { Socket, SocketData } from '@privateaim/server-realtime-kit';
import {
    createServer,
    mountAuthorizationMiddleware,
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

    mountAuthorizationMiddleware(nsp, {
        baseURL: useEnv('authupURL'),
        tokenVerifier: createAuthupTokenVerifier({
            baseURL: useEnv('authupURL'),
            creator: createAuthupClientTokenCreator({
                baseURL: useEnv('authupURL'),
                clientId: useEnv('clientId'),
                clientSecret: useEnv('clientSecret'),
                realm: useEnv('realm'),
            }),
        }),
    });

    nsp.use((socket: Socket, next) => {
        if (!socket.data.identity) {
            next();
            return;
        }

        const matches = socket.nsp.name.match(pattern);
        if (typeof matches[1] === 'undefined') {
            if (socket.data.identity.realmName !== REALM_MASTER_NAME) {
                useLogger()
                    .error({
                        message: `Socket/${socket.id}: Realm ${socket.data.identity.realmName} is not permitted for the global scope.`,
                        [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                    });
                next(new ForbiddenError());

                return;
            }
        } else {
            [, socket.data.namespaceId] = matches;

            if (
                matches[1] !== socket.data.identity.realmId &&
                socket.data.identity.realmName !== REALM_MASTER_NAME
            ) {
                useLogger()
                    .error({
                        message: `Socket/${socket.id}: Realm ${socket.data.identity.realmName} is not permitted for the realm ${matches[1]}.`,
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
