/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from '@privateaim/core-http-kit';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

export function createTestClient(server: Server) : Client {
    const address = server.address() as AddressInfo;
    const baseURL = `http://localhost:${address.port}`;

    const client = new Client({
        baseURL,
    });

    client.setAuthorizationHeader({
        type: 'Basic',
        username: 'admin',
        password: 'start123',
    });

    return client;
}
