/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MasterImagesBasePayload,
    MasterImagesBuildingEventPayload,
    MasterImagesBuiltEventPayload,
    MasterImagesPushEventPayload,
    MaterImagesSynchronizedEventPayload,
} from '@privateaim/server-analysis-manager-kit';
import {
    MasterImagesCommand,
    MasterImagesEvent,
    buildMasterImagesTaskQueueRouterPayload,
} from '@privateaim/server-analysis-manager-kit';
import type { QueueRouterHandlers } from '@privateaim/server-kit';
import { useQueueRouter } from '@privateaim/server-kit';
import { MasterImageDatabaseService, useMasterImageService } from '../../../services';

export function createAnalysisManagerMasterImagesHandlers() : QueueRouterHandlers<{
    [MasterImagesEvent.BUILDING]: MasterImagesBuildingEventPayload,
    [MasterImagesEvent.BUILT]: MasterImagesBuiltEventPayload,
    [MasterImagesEvent.BUILD_FAILED]: MasterImagesBasePayload,

    [MasterImagesEvent.PUSHING]: MasterImagesPushEventPayload,
    [MasterImagesEvent.PUSHED]: MasterImagesPushEventPayload,
    [MasterImagesEvent.PUSH_FAILED]: MasterImagesBasePayload,

    [MasterImagesEvent.SYNCHRONIZING]: MasterImagesBasePayload,
    [MasterImagesEvent.SYNCHRONIZED]: MaterImagesSynchronizedEventPayload,
    [MasterImagesEvent.SYNCHRONIZATION_FAILED]: MasterImagesBasePayload
}> {
    const queueRouter = useQueueRouter();
    const masterImageService = useMasterImageService();
    const masterImageDatabaseService = new MasterImageDatabaseService();

    return {
        [MasterImagesEvent.SYNCHRONIZING]: async (message) => {
            await masterImageService.logEvent(
                MasterImagesEvent.SYNCHRONIZING,
                message.data,
            );
        },
        [MasterImagesEvent.SYNCHRONIZED]: async (message) => {
            await masterImageService.logEvent(
                MasterImagesEvent.SYNCHRONIZED,
                message.data,
            );

            await masterImageDatabaseService
                .synchronizeGroups(message.data.groups);

            // images
            const output = await masterImageDatabaseService
                .synchronize(message.data.images);

            const entities = [
                ...output.created,
                ...output.deleted,
            ];

            for (let i = 0; i < entities.length; i++) {
                const queueRouterPayload = buildMasterImagesTaskQueueRouterPayload({
                    command: MasterImagesCommand.BUILD,
                    data: {
                        id: entities[i].id,
                        path: entities[i].path,
                        virtualPath: entities[i].virtual_path,
                    },
                });

                await queueRouter.publish(queueRouterPayload);
            }
        },
        [MasterImagesEvent.SYNCHRONIZATION_FAILED]: async (message) => {
            await masterImageService.logEvent(
                MasterImagesEvent.SYNCHRONIZATION_FAILED,
                message.data,
            );
        },

        [MasterImagesEvent.BUILDING]: async (message) => {
            await masterImageService.logEvent(
                MasterImagesEvent.BUILDING,
                message.data,
            );
        },
        [MasterImagesEvent.BUILT]: async (message) => {
            await masterImageService.logEvent(
                MasterImagesEvent.BUILT,
                message.data,
            );

            const queueRouter = useQueueRouter();

            const queueRouterPayload = buildMasterImagesTaskQueueRouterPayload({
                command: MasterImagesCommand.PUSH,
                data: {
                    id: message.data.id,
                    tags: message.data.tags,
                },
            });

            await queueRouter.publish(queueRouterPayload);
        },
        [MasterImagesEvent.BUILD_FAILED]: async (message) => {
            await masterImageService.logEvent(
                MasterImagesEvent.BUILD_FAILED,
                message.data,
            );
        },

        [MasterImagesEvent.PUSHING]: async (message) => {
            await masterImageService.logEvent(
                MasterImagesEvent.PUSHING,
                message.data,
            );
        },
        [MasterImagesEvent.PUSHED]: async (message) => {
            await masterImageService.logEvent(
                MasterImagesEvent.PUSHED,
                message.data,
            );
        },
        [MasterImagesEvent.PUSH_FAILED]: async (message) => {
            await masterImageService.logEvent(
                MasterImagesEvent.PUSH_FAILED,
                message.data,
            );

            // todo: clear built docker image
        },
    };
}
