import type { Client } from 'redis-extension';

let instance : undefined | Client;
let instancePublish : undefined | Client;

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

export function useRedisPublishClient() {
    if (typeof instancePublish !== 'undefined') {
        return instancePublish;
    }

    instancePublish = useRedisClient().duplicate();
    return instancePublish;
}
