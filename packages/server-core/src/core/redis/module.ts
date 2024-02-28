/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from 'redis-extension';
import type { Factory } from 'singa';
import { singa } from 'singa';

const instance = singa<Client>({
    name: 'redis',
});

const instancePublish = singa<Client>({
    name: 'redisPublish',
    factory: () => instance.use().duplicate(),
});

const instanceSubscribe = singa<Client>({
    name: 'redisSubscribe',
    factory: () => instance.use().duplicate(),
});

export function setRedisFactory(factory: Factory<Client>) {
    instance.setFactory(factory);
}

export function hasRedisClient() {
    return instance.has() || instance.hasFactory();
}

export function useRedisClient() {
    return instance.use();
}

export function useRedisPublishClient() {
    return instancePublish.use();
}

export function useRedisSubscribeClient() {
    return instanceSubscribe.use();
}
