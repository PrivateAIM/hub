/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from '@privateaim/core-http-kit';
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createNodeDispatcher } from 'routup';
import { createConfig } from '../../src';
import { createRouter } from '../../src/http/router';
import { dropTestDatabase, useTestDatabase } from './database';

class TestSuite {
    protected _client : Client | undefined;

    protected _server : Server | undefined;

    constructor() {
        createConfig();
    }

    client() : Client {
        if (typeof this._client === 'undefined') {
            this.createClient();
        }

        return this._client;
    }

    async up() {
        await useTestDatabase();

        await this.startServer();
    }

    async down() {
        await dropTestDatabase();

        this.stopServer();
    }

    protected async startServer() : Promise<void> {
        const router = createRouter();
        const server = createServer(createNodeDispatcher(router));

        this._server = await new Promise<Server>((resolve, reject) => {
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

    protected stopServer() {
        if (!this._server) {
            return;
        }

        this._server.close();
        this._server = undefined;
    }

    protected createClient() {
        if (typeof this._server === 'undefined') {
            throw new SyntaxError('The test server is not initialized.');
        }

        const address = this._server.address() as AddressInfo;
        const baseURL = `http://localhost:${address.port}`;

        const client = new Client({
            baseURL,
        });

        client.setAuthorizationHeader({
            type: 'Basic',
            username: 'admin',
            password: 'start123',
        });

        this._client = client;
    }
}

export function createTestSuite() : TestSuite {
    return new TestSuite();
}
