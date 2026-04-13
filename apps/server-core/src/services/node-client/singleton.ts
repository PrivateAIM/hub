/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isAuthupClientUsable } from '@privateaim/server-kit';
import { singa } from 'singa';
import { NodeClientService } from './module.ts';

const instance = singa<NodeClientService>({
    name: 'nodeClient',
    factory: () => new NodeClientService(),
});

export function isNodeClientServiceUsable() {
    return isAuthupClientUsable();
}

export function useNodeClientService(): NodeClientService {
    return instance.use();
}
