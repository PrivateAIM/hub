/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from 'redis-extension';
import type { Factory } from 'singa';
import { singa } from 'singa';

const singleton = singa<Client>({
    name: 'redis',
});

export function useRedis() {
    return singleton.use();
}

export function setRedisFactory(factory: Factory<Client>) {
    return singleton.setFactory(factory);
}
