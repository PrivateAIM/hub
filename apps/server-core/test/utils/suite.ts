/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from '@privateaim/core-http-kit';
import {
    BaseApplicationBuilder,
    createAuthupClientAuthenticationHook,
    createAuthupUserTokenCreator,
} from '@privateaim/server-kit';
import { Container } from 'eldin';
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createNodeDispatcher } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { ConfigInjectionKey } from '../../src/app/modules/config';
import { DatabaseInjectionKey, registerRepositories } from '../../src/app/modules/database';
import { HTTPInjectionKey, HTTPModule } from '../../src/app/modules/http';
import { createConfig, useEnv } from '../../src';
import { TestDatabase } from './database';

class TestSuite {
    protected _client : Client | undefined;

    protected _server : Server | undefined;

    protected _database : TestDatabase;

    constructor() {
        this._database = new TestDatabase();
    }

    client() : Client {
        if (typeof this._client === 'undefined') {
            this.createClient();
        }

        return this._client;
    }

    async up() {
        // Setup shared modules (logger only — tests don't need redis/amqp)
        const app = new BaseApplicationBuilder()
            .withLogger()
            .build();
        await app.setup();

        createConfig();

        await this._database.up();

        await this.startServer();
    }

    async down() {
        await this._database.down();

        this.stopServer();
    }

    protected async startServer() : Promise<void> {
        const dataSource = await useDataSource();

        // Register config, DataSource, and repositories in a container for HTTPModule
        const config = useEnv();
        const container = new Container();
        container.register(ConfigInjectionKey, { useValue: config });
        container.register(DatabaseInjectionKey.DataSource, { useValue: dataSource });
        registerRepositories(container, dataSource);

        // Use HTTPModule to wire controllers (skip server creation)
        const httpModule = new HTTPModule({ skipServer: true });
        await httpModule.setup(container);

        const router = container.resolve(HTTPInjectionKey.Router);
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

        const client = new Client({ baseURL });

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
