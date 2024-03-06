/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { APIClient } from '@privateaim/core';
import type { App } from 'vue';
import { inject, provide } from 'vue';

const symbol = Symbol.for('FCoreAPIClient');

export function provideCoreAPIClient(client: APIClient, instance?: App) {
    if (instance) {
        instance.provide(symbol, client);
        return;
    }

    provide(symbol, client);
}

export function injectCoreAPIClient(): APIClient {
    const instance = inject(symbol);
    if (!instance) {
        throw new Error('The API Client is not set.');
    }

    return instance as APIClient;
}
