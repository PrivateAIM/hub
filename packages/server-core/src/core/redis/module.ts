/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

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
