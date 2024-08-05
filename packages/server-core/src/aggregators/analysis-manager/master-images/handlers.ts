/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MasterImagesBasePayload,
    MaterImagesSynchronizedEventPayload,
} from '@privateaim/server-analysis-manager-kit';
import {
    MasterImagesEvent,
} from '@privateaim/server-analysis-manager-kit';
import { useMemoryCache } from '@privateaim/server-kit';
import type { QueueRouterHandlers } from '@privateaim/server-kit';
import { MemoryCacheID } from '../../../constants';
import { syncMasterImageGroups, syncMasterImages } from './utils';

export function createAnalysisManagerMasterImagesHandlers() : QueueRouterHandlers<{
    [MasterImagesEvent.SYNCHRONIZED]: MaterImagesSynchronizedEventPayload,
    [MasterImagesEvent.BUILD_FAILED]: MasterImagesBasePayload,
    [MasterImagesEvent.PUSH_FAILED]: MasterImagesBasePayload,
    [MasterImagesEvent.SYNCHRONIZATION_FAILED]: MasterImagesBasePayload
}> {
    const memoryCache = useMemoryCache();

    return {
        [MasterImagesEvent.SYNCHRONIZED]: async (message) => {
            memoryCache.del(MemoryCacheID.MASTER_IMAGES);

            // languages
            await syncMasterImageGroups(message.data.groups);

            // images
            await syncMasterImages(message.data.images);
        },
        [MasterImagesEvent.BUILD_FAILED]: () => {
            memoryCache.del(MemoryCacheID.MASTER_IMAGES);
        },
        [MasterImagesEvent.PUSH_FAILED]: () => {
            memoryCache.del(MemoryCacheID.MASTER_IMAGES);
        },
        [MasterImagesEvent.SYNCHRONIZATION_FAILED]: () => {
            memoryCache.del(MemoryCacheID.MASTER_IMAGES);
        },
    };
}
