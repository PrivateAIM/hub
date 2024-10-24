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
import { useCache, useLogger } from '@privateaim/server-kit';
import type { QueueRouterHandlers } from '@privateaim/server-kit';
import { MemoryCacheID } from '../../../constants';
import { syncMasterImageGroups, syncMasterImages } from './synchronize';

export function createAnalysisManagerMasterImagesHandlers() : QueueRouterHandlers<{
    [MasterImagesEvent.SYNCHRONIZED]: MaterImagesSynchronizedEventPayload,
    [MasterImagesEvent.BUILD_FAILED]: MasterImagesBasePayload,
    [MasterImagesEvent.PUSH_FAILED]: MasterImagesBasePayload,
    [MasterImagesEvent.SYNCHRONIZATION_FAILED]: MasterImagesBasePayload
}> {
    const memoryCache = useCache();

    return {
        [MasterImagesEvent.SYNCHRONIZED]: async (message) => {
            await memoryCache.drop(MemoryCacheID.MASTER_IMAGES);

            useLogger().debug('Synchronizing master images', {
                groups: message.data.groups.length,
                images: message.data.images.length,
            });

            // languages
            const imageGroups = await syncMasterImageGroups(message.data.groups);

            useLogger().info(`Created ${imageGroups.created.length} master image groups`);
            useLogger().info(`Updated ${imageGroups.updated.length} master image groups`);
            useLogger().info(`Deleted ${imageGroups.deleted.length} master image groups`);

            // images
            const images = await syncMasterImages(message.data.images);

            useLogger().info(`Created ${images.created.length} master images`);
            useLogger().info(`Updated ${images.updated.length} master images`);
            useLogger().info(`Deleted ${images.deleted.length} master images`);
        },
        [MasterImagesEvent.BUILD_FAILED]: async () => {
            await memoryCache.drop(MemoryCacheID.MASTER_IMAGES);
        },
        [MasterImagesEvent.PUSH_FAILED]: async () => {
            await memoryCache.drop(MemoryCacheID.MASTER_IMAGES);
        },
        [MasterImagesEvent.SYNCHRONIZATION_FAILED]: async () => {
            await memoryCache.drop(MemoryCacheID.MASTER_IMAGES);
        },
    };
}
