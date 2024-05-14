/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { APIClient as Client } from '@privateaim/core';
import type { App } from 'vue';
import { setupBaseHTTPClient } from '../setup';
import type { BaseHTTPClientInstallOptions } from '../types';
import { isCoreHTTPClientUsable, provideCoreHTTPClient } from './singleton';

export function installCoreHTTPClient(app: App, options: BaseHTTPClientInstallOptions) {
    if (isCoreHTTPClientUsable(app)) {
        return;
    }

    const client = new Client({ baseURL: options.baseURL });

    setupBaseHTTPClient(app, client);

    provideCoreHTTPClient(client, app);
}
