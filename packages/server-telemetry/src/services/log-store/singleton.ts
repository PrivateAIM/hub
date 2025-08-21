/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Factory } from 'singa';
import { singa } from 'singa';
import type { LogStore } from './types';
import { LokiLogStore, MemoryLogStore } from './entities';
import { isLokiClientUsable, useLokiClient } from '../loki';

const instance = singa<LogStore>({
    name: 'logStore',
    factory: () => {
        if (isLokiClientUsable()) {
            const loki = useLokiClient();
            return new LokiLogStore(loki);
        }

        return new MemoryLogStore();
    },
});

export function isLogStoreUsable() {
    return instance.has() || instance.hasFactory();
}

export function setLogStoreFactory(input: Factory<LogStore>) {
    instance.setFactory(input);
}

export function useLogStore(): LogStore {
    return instance.use();
}
