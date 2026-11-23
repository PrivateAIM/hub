/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createServer as createHTTPServer } from 'node:http';
import { Server } from 'socket.io';
import { io } from 'socket.io-client';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { mountForceLoggedInMiddleware } from '../../src';

describe('mountForceLoggedInMiddleware', () => {
    const httpServer = createHTTPServer();
    const server = new Server(httpServer);
    let url: string;

    beforeAll(async () => {
        // Stands in for the authup middleware: a handshake carrying a token
        // gets an identity, any other stays anonymous.
        server.use((socket, next) => {
            if (socket.handshake.auth.token) {
                socket.data.identity = { type: 'user', id: 'user-id' };
            }

            next();
        });
        mountForceLoggedInMiddleware(server);

        await new Promise<void>((resolve) => {
            httpServer.listen(0, () => resolve());
        });

        const address = httpServer.address();

        if (!address || typeof address === 'string') {
            throw new Error('The http server has no port.');
        }

        url = `http://127.0.0.1:${address.port}`;
    });

    afterAll(async () => {
        await server.close();
    });

    const connect = (auth: Record<string, string>) => new Promise<string>((resolve) => {
        const client = io(url, {
            auth, 
            transports: ['websocket'], 
            reconnection: false, 
        });

        client.on('connect', () => {
            client.close();
            resolve('connected');
        });
        client.on('connect_error', (err) => {
            client.close();
            resolve(err.message);
        });
    });

    it('lets an authenticated socket connect', async () => {
        expect(await connect({ token: 'token' })).toEqual('connected');
    });

    it('rejects an unauthenticated socket', async () => {
        expect(await connect({})).not.toEqual('connected');
    });
});
