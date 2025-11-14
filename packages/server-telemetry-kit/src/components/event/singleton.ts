/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { isQueueRouterUsable } from '@privateaim/server-kit';
import { EventComponentCaller } from './module';

const instance = singa<EventComponentCaller>({
    name: 'eventComponentService',
    factory: () => new EventComponentCaller(),
});

export function isEventComponentCallerUsable() {
    return isQueueRouterUsable();
}

export function useEventComponentCaller(): EventComponentCaller {
    return instance.use();
}
