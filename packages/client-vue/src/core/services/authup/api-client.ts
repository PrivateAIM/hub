/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { injectAPIClient, provideAPIClient } from '@authup/client-web-kit';
import type { Client } from '@authup/core-http-kit';
import type { App } from 'vue';

export type AuthupAPIClient = Client;
export function provideAuthupAPIClient(client: Client, instance?: App) {
    provideAPIClient(client, instance);
}

export function injectAuthupAPIClient() : Client {
    return injectAPIClient();
}
