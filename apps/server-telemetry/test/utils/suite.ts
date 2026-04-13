/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseApplicationBuilder, createAuthupClientAuthenticationHook, createAuthupUserTokenCreator  } from '@privateaim/server-kit';
import { APIClient } from '@privateaim/telemetry-kit';
import { write } from 'envix';
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createNodeDispatcher } from 'routup';
import { inject } from 'vitest';
import { EnvironmentInputKey, useEnv } from '../../src';
import { VictoriaLogsModule } from '../../src/app/modules/victoria-logs';
import { createHTTPRouter } from '../../src/http';
import { TestDatabase } from './database';

class TestSuite {
    protected _client : APIClient | undefined;

    protected _server : Server | undefined;

    protected _database : TestDatabase;

    constructor() {
        write(
            EnvironmentInputKey.VICTORIA_LOGS_URL,
            `http://${inject('VL_CONTAINER_HOST')}:${inject('VL_CONTAINER_PORT')}`,
        );

        this._database = new TestDatabase();
    }

    client() : APIClient {
        if (typeof this._client === 'undefined') {
            this.createClient();
        }

        return this._client;
    }

    async up() {
        const env = useEnv();
        const app = new BaseApplicationBuilder()
            .withLogger()
            .build();
        app.addModule(new VictoriaLogsModule({
            baseURL: env.victoriaLogsURL,
            ingestorURL: env.victoriaLogsIngestorURL,
            querierURL: env.victoriaLogsQuerierURL,
        }));
        await app.setup();

        await this._database.up();

        await this.startServer();
    }

    async down() {
        await this._database.down();

        this.stopServer();
    }

    protected async startServer() : Promise<void> {
        const router = createHTTPRouter();
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

        const client = new APIClient({ baseURL });

        const authupURL = useEnv('authupURL');
        if (authupURL) {
            const hook = createAuthupClientAuthenticationHook({
                baseURL: authupURL,
                tokenCreator: createAuthupUserTokenCreator({
                    baseURL: authupURL,
                    name: 'admin',
                    password: 'start123',
                    realm: 'master',
                }),
            });

            hook.attach(client);
        }

        this._client = client;
    }
}

export function createTestSuite() : TestSuite {
    return new TestSuite();
}
