import type { Client } from 'redis-extension';

let instance : undefined | Client;

export function setRedisClient(client: Client) {
    instance = client;
}

export function hasRedisClient() {
    return typeof instance !== 'undefined';
}

export function useRedisClient() {
    if (typeof instance === 'undefined') {
        throw Error('Redis is not configured.');
    }

    return instance;
}
