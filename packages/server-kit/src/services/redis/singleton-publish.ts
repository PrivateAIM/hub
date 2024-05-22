/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from 'redis-extension';
import { singa } from 'singa';
import { useRedisClient } from './singleton';

const instance = singa<Client>({
    name: 'redisPublish',
    factory: () => useRedisClient().duplicate(),
});

export function useRedisPublishClient() {
    return instance.use();
}
