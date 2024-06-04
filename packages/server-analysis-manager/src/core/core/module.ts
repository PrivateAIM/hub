/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Factory } from 'singa';
import { singa } from 'singa';
import type { Client } from '@privateaim/core-http-kit';

const instance = singa<Client>({
    name: 'core',
});

export function setCoreFactory(factory: Factory<Client>) {
    instance.setFactory(factory);
}

export function useCoreClient() {
    return instance.use();
}
