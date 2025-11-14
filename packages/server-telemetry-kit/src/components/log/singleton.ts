/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { isQueueRouterUsable } from '@privateaim/server-kit';
import { LogComponentCaller } from './module';

const instance = singa<LogComponentCaller>({
    name: 'logComponentService',
    factory: () => new LogComponentCaller(),
});

export function isLogComponentCallerUsable() {
    return isQueueRouterUsable();
}

export function useLogComponentCaller(): LogComponentCaller {
    return instance.use();
}
