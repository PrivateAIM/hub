/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { APIClient } from '@privateaim/telemetry-kit';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import {
    ConfigInjectionKey,
    createAuthupClientAuthenticationHook,
    createAuthupUserTokenCreator,
} from '@privateaim/server-kit';
import { HTTPInjectionKey } from '../../src/app/modules/http/index.ts';
import { TestApplication } from './module.ts';

export class TestHTTPApplication extends TestApplication {
    protected _client: APIClient | undefined;

    get client(): APIClient {
        if (typeof this._client === 'undefined') {
            this._client = this.createClient();
        }

        return this._client;
    }

    protected createClient(): APIClient {
        const server = this.container.resolve<Server>(HTTPInjectionKey.Server);

        const address = server.address() as AddressInfo;
        const baseURL = `http://localhost:${address.port}`;

        const client = new APIClient({ baseURL });

        const config = this.container.resolve(ConfigInjectionKey);
        if (config.authupURL) {
            const hook = createAuthupClientAuthenticationHook({
                baseURL: config.authupURL,
                tokenCreator: createAuthupUserTokenCreator({
                    baseURL: config.authupURL,
                    name: 'admin',
                    password: 'start123',
                    realm: 'master',
                }),
            });

            hook.attach(client);
        }

        return client;
    }
}
