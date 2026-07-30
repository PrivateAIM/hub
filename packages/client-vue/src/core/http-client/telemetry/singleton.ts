/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ITelemetryClient } from '@privateaim/telemetry-kit';
import type { App } from 'vue';
import { inject, provide } from '@authup/client-web-kit';

const symbol = Symbol.for('FTelemetryHTTPClient');

export function provideTelemetryHTTPClient(client: ITelemetryClient, app?: App) {
    provide(symbol, client, app);
}

export function isTelemetryHTTPClientUsable(app?: App) : boolean {
    return !!inject(symbol, app);
}

export function injectTelemetryHTTPClient(app?: App): ITelemetryClient {
    const instance = inject<ITelemetryClient>(symbol, app);
    if (!instance) {
        throw new Error('The Telemetry HTTP Client is not set.');
    }

    return instance;
}
