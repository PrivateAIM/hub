/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { LogComponentService } from './module';

const instance = singa<LogComponentService>({
    name: 'logComponentService',
    factory: () => new LogComponentService(),
});

export function isLogComponentServiceUsable() {
    return instance.has() || instance.hasFactory();
}

export function useLogComponentService(): LogComponentService {
    return instance.use();
}
