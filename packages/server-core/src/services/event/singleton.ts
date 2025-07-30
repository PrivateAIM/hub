/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import { singa } from 'singa';
import { EventServiceAnalysisNodeHook, EventServiceMasterImageHook } from './hooks';
import { EventService } from './module';

const instance = singa<EventService>({
    name: 'eventService',
    factory: () : EventService => new EventService({
        [DomainType.ANALYSIS_NODE]: new EventServiceAnalysisNodeHook(),
        [DomainType.MASTER_IMAGE]: new EventServiceMasterImageHook(),
    }),
});

export function useEventService(): EventService {
    return instance.use();
}
