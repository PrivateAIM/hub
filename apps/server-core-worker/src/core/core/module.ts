/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from '@privateaim/core-http-kit';

let instance : Client | undefined;

export function setCoreClient(client: Client) {
    instance = client;
}

export function useCoreClient(): Client {
    if (typeof instance === 'undefined') {
        throw new Error('Core client has not been initialized.');
    }

    return instance;
}
