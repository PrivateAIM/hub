/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Factory } from 'singa';
import { singa } from 'singa';
import type { LogStore } from './types.ts';
import { MemoryLogStore, VictoriaLogsLogStore } from './entities/index.ts';
import { isVictoriaLogsClientUsable, useVictoriaLogsClient } from '../victoria-logs/index.ts';

const instance = singa<LogStore>({
    name: 'logStore',
    factory: () => {
        if (isVictoriaLogsClientUsable()) {
            const loki = useVictoriaLogsClient();
            return new VictoriaLogsLogStore(loki);
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
