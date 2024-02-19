/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { VaultClient } from '@hapic/vault';

let instance : undefined | VaultClient;

export function setVaultClient(client: VaultClient) {
    instance = client;
}

export function hasVaultClient() {
    return typeof instance !== 'undefined';
}

export function useVaultClient() {
    if (typeof instance === 'undefined') {
        throw Error('Vault is not configured.');
    }

    return instance;
}
