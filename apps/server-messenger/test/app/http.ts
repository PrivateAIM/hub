/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from '@privateaim/messenger-http-kit';
import type { IMessengerClient } from '@privateaim/messenger-http-kit';
import {
    ConfigInjectionKey,
    createAuthupClientAuthenticationHook,
    createAuthupUserTokenCreator,
} from '@privateaim/server-kit';
import type { HTTPServer } from '../../src/app/modules/http/constants.ts';
import { HTTPInjectionKey } from '../../src/app/modules/http/index.ts';
import { TestApplication } from './module.ts';

export class TestHTTPApplication extends TestApplication {
    protected _client: IMessengerClient | undefined;

    get baseURL(): string {
        const server = this.container.resolve<HTTPServer>(HTTPInjectionKey.Server);
        // server binds 0.0.0.0; connecting to that hangs on macOS — target loopback
        return (server.url ?? '').replace('0.0.0.0', '127.0.0.1');
    }

    get client(): IMessengerClient {
        if (typeof this._client === 'undefined') {
            this._client = this.createClient();
        }

        return this._client;
    }

    /**
     * A client authenticated as the `admin`/`master` user. Pass an access
     * token to act as a different identity instead.
     */
    createClient(accessToken?: string): IMessengerClient {
        if (accessToken) {
            return new Client({
                baseURL: this.baseURL,
                headers: { authorization: `Bearer ${accessToken}` },
            });
        }

        const client = new Client({ baseURL: this.baseURL });

        const config = this.container.resolve(ConfigInjectionKey);
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

        return client;
    }
}
