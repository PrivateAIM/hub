/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Factory } from 'singa';
import { singa } from 'singa';
import type { LokiClient } from '@hapic/loki';

const instance = singa<LokiClient>({
    name: 'loki',
});

export function setLokiFactory(factory: Factory<LokiClient>) {
    instance.setFactory(factory);
}

export function isLokiClientUsable() {
    return instance.has() || instance.hasFactory();
}

export function useLokiClient() {
    return instance.use();
}
