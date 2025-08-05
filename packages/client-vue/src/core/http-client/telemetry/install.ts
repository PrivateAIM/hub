/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { APIClient as Client } from '@privateaim/telemetry-kit';
import type { App } from 'vue';
import { setupBaseHTTPClient } from '../setup';
import type { BaseHTTPClientInstallOptions } from '../types';
import { isTelemetryHTTPClientUsable, provideTelemetryHTTPClient } from './singleton';

export function installTelemetryHTTPClient(app: App, options: BaseHTTPClientInstallOptions) {
    if (isTelemetryHTTPClientUsable(app)) {
        return;
    }

    const client = new Client({ baseURL: options.baseURL });

    setupBaseHTTPClient(app, client);

    provideTelemetryHTTPClient(client, app);
}
