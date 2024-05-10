/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from '@authup/core-http-kit';
import type { Factory } from 'singa';
import { singa } from 'singa';

const singleton = singa<Client>({
    name: 'authup',
});

export function useAuthupClient() {
    return singleton.use();
}

export function hasAuthupClient() {
    return singleton.has() || singleton.hasFactory();
}

export function setAuthupClientFactory(factory: Factory<Client>) {
    return singleton.setFactory(factory);
}
