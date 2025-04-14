/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client as BaseClient } from 'hapic';
import {
    injectHTTPClientAuthenticationHook,
} from '@authup/client-web-kit';
import type { App } from 'vue';

export function setupBaseHTTPClient(app: App, client: BaseClient) {
    const hook = injectHTTPClientAuthenticationHook(app);
    hook.attach(client);
}
