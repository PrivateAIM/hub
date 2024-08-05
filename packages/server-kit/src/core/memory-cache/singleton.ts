/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { MemoryCache } from './module';

const instance = singa<MemoryCache>({
    name: 'queueRouter',
    factory: () => new MemoryCache(),
});

export function useMemoryCache() {
    return instance.use();
}
