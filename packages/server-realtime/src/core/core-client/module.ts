import type { APIClient } from '@personalhealthtrain/core';

let instance : APIClient | undefined;

export function useAPIClient(): APIClient {
    if (typeof instance === 'undefined') {
        throw new Error('The core API-Client is not configured.');
    }

    return instance;
}

export function setAPIClient(input: APIClient) {
    instance = input;
}
