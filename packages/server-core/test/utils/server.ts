/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { type Server, createServer } from 'node:http';
import { createNodeDispatcher } from 'routup';
import { createRouter } from '../../src/http/router';

export async function createTestServer() {
    const router = createRouter();
    const server = createServer(createNodeDispatcher(router));

    return new Promise<Server>((resolve, reject) => {
        const errorHandler = (err?: null | Error) => {
            reject(err);
        };

        server.once('error', errorHandler);
        server.once('listening', () => {
            server.removeListener('error', errorHandler);

            resolve(server);
        });

        server.listen();
    });
}
