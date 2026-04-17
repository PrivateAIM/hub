/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { APIClient } from '@privateaim/storage-kit';

let instance : APIClient | undefined;

export function setStorageClient(client: APIClient) {
    instance = client;
}

export function useStorageClient(): APIClient {
    if (typeof instance === 'undefined') {
        throw new Error('Storage client has not been initialized.');
    }

    return instance;
}
