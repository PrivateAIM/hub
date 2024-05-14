/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { APIClient } from '@privateaim/core';
import type { App } from 'vue';
import { inject, provide } from '@authup/client-web-kit';

const symbol = Symbol.for('FCoreHTTPClient');

export function provideCoreHTTPClient(client: APIClient, app?: App) {
    provide(symbol, client, app);
}

export function isCoreHTTPClientUsable(app?: App) : boolean {
    return !!inject(symbol, app);
}

export function injectCoreHTTPClient(app?: App): APIClient {
    const instance = inject<APIClient>(symbol, app);
    if (!instance) {
        throw new Error('The Core HTTP Client is not set.');
    }

    return instance;
}
