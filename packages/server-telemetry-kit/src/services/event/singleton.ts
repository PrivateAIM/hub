/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { singa } from 'singa';
import { isQueueRouterUsable } from '@privateaim/server-kit';
import { EventComponentService } from './module';

const instance = singa<EventComponentService>({
    name: 'eventComponentService',
    factory: () => new EventComponentService(),
});

export function isEventComponentServiceUsable() {
    return isQueueRouterUsable();
}

export function useEventComponentService(): EventComponentService {
    return instance.use();
}
