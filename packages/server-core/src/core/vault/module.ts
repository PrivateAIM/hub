import type { VaultClient } from "@hapic/vault";

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
