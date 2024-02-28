/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { APIClient } from '@authup/core';
import type { Factory } from 'singa';
import { singa } from 'singa';

const instance = singa<APIClient>({
    name: 'authup',
});

export function useAuthupClient() {
    return instance.use();
}

export function hasAuthupClient() {
    return instance.has() || instance.hasFactory();
}

export function setAuthupFactory(factory: Factory<APIClient>) {
    instance.setFactory(factory);
}
