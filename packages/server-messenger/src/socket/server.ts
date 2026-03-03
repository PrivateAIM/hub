/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createAuthupTokenVerifier } from '@privateaim/server-http-kit';
import { createAuthupClientTokenCreator } from '@privateaim/server-kit';
import {
    createServer,
    mountAuthorizationMiddleware,
    mountLoggingMiddleware,
} from '@privateaim/server-realtime-kit';
import type { Server as HTTPServer } from 'node:http';
import type { Server } from 'socket.io';
import { useEnv } from '../config/index.ts';
import { registerControllers } from './register.ts';

export function createSocketServer(httpServer: HTTPServer) : Server {
    const server = createServer(httpServer);

    mountLoggingMiddleware(server);

    mountAuthorizationMiddleware(server, {
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

    registerControllers(server);

    return server;
}
