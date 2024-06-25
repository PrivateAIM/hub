/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from '@privateaim/core-http-kit';
import type { Server } from 'node:http';
import { createConfig } from '../../src';
import { createTestClient } from './client';
import { dropTestDatabase, useTestDatabase } from './database';
import { createTestServer } from './server';

class TestSuite {
    protected _client : Client | undefined;

    protected _server : Server | undefined;

    constructor() {
        createConfig();
    }

    client() : Client {
        if (typeof this._client === 'undefined') {
            throw new SyntaxError('The client instance is not initialized');
        }

        return this._client;
    }

    async up() {
        await useTestDatabase();

        this._server = await createTestServer();
        this._client = createTestClient(this._server);
    }

    async down() {
        await dropTestDatabase();

        if (this._server) {
            this._server.close();
        }
    }
}

export function createTestSuite() : TestSuite {
    return new TestSuite();
}
