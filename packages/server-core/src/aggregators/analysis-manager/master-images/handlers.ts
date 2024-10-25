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
import type { QueueRouterHandlers } from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import { useMasterImageService } from '../../../services';
import { syncMasterImageGroups, syncMasterImages } from './synchronize';

export function createAnalysisManagerMasterImagesHandlers() : QueueRouterHandlers<{
    [MasterImagesEvent.BUILDING]: MasterImagesBasePayload,
    [MasterImagesEvent.BUILT]: MasterImagesBasePayload,
    [MasterImagesEvent.BUILD_FAILED]: MasterImagesBasePayload,

    [MasterImagesEvent.PUSHING]: MasterImagesBasePayload,
    [MasterImagesEvent.PUSHED]: MasterImagesBasePayload,
    [MasterImagesEvent.PUSH_FAILED]: MasterImagesBasePayload,

    [MasterImagesEvent.SYNCHRONIZING]: MasterImagesBasePayload,
    [MasterImagesEvent.SYNCHRONIZED]: MaterImagesSynchronizedEventPayload,
    [MasterImagesEvent.SYNCHRONIZATION_FAILED]: MasterImagesBasePayload
}> {
    const masterImageService = useMasterImageService();

    return {
        [MasterImagesEvent.SYNCHRONIZING]: async () => {
            await masterImageService.handleEvent(
                MasterImagesEvent.SYNCHRONIZING,
            );
        },
        [MasterImagesEvent.SYNCHRONIZED]: async (message) => {
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

            await masterImageService.handleEvent(
                MasterImagesEvent.SYNCHRONIZED,
            );
        },
        [MasterImagesEvent.SYNCHRONIZATION_FAILED]: async (message) => {
            await masterImageService.handleEvent(
                MasterImagesEvent.SYNCHRONIZATION_FAILED,
                `${message.data.error}`,
            );
        },

        [MasterImagesEvent.BUILDING]: async () => {
            await masterImageService.handleEvent(
                MasterImagesEvent.BUILDING,
            );
        },
        [MasterImagesEvent.BUILT]: async () => {
            await masterImageService.handleEvent(
                MasterImagesEvent.BUILT,
            );
        },
        [MasterImagesEvent.BUILD_FAILED]: async (message) => {
            await masterImageService.handleEvent(
                MasterImagesEvent.BUILD_FAILED,
                `${message.data.error}`,
            );
        },

        [MasterImagesEvent.PUSHING]: async () => {
            await masterImageService.handleEvent(
                MasterImagesEvent.PUSHING,
            );
        },
        [MasterImagesEvent.PUSHED]: async () => {
            await masterImageService.handleEvent(
                MasterImagesEvent.PUSHED,
            );
        },
        [MasterImagesEvent.PUSH_FAILED]: async (message) => {
            await masterImageService.handleEvent(
                MasterImagesEvent.PUSH_FAILED,
                `${message.data.error}`,
            );
        },
    };
}
