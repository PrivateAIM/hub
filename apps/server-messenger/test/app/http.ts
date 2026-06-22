/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from '@privateaim/messenger-http-kit';
import type { HTTPServer } from '../../src/app/modules/http/constants.ts';
import { HTTPInjectionKey } from '../../src/app/modules/http/index.ts';
import { TestApplication } from './module.ts';

export class TestHTTPApplication extends TestApplication {
    protected _client: Client | undefined;

    get baseURL(): string {
        const server = this.container.resolve<HTTPServer>(HTTPInjectionKey.Server);
        // server binds 0.0.0.0; connecting to that hangs on macOS — target loopback
        return (server.url ?? '').replace('0.0.0.0', '127.0.0.1');
    }

    get client(): Client {
        if (typeof this._client === 'undefined') {
            this._client = new Client({ baseURL: this.baseURL });
        }

        return this._client;
    }
}
