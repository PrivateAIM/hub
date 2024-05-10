/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from '@authup/core-http-kit';
import type { Factory } from 'singa';
import { singa } from 'singa';

const instance = singa<Client>({
    name: 'authup',
});

export function useAuthupClient() {
    return instance.use();
}

export function hasAuthupClient() {
    return instance.has() || instance.hasFactory();
}

export function setAuthupFactory(factory: Factory<Client>) {
    instance.setFactory(factory);
}
