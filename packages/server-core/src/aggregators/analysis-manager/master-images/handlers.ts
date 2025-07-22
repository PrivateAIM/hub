/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MasterImagesEventContext,
    MasterImagesEventMap,
} from '@privateaim/server-analysis-manager-kit';
import {
    MasterImagesCommand,
    MasterImagesEvent,
    useMasterImageQueueService,
} from '@privateaim/server-analysis-manager-kit';
import type { QueueRouterHandlers } from '@privateaim/server-kit';
import { MasterImageSynchronizerService, useMasterImageService } from '../../../services';

export function createAnalysisManagerMasterImagesHandlers() : QueueRouterHandlers<Partial<MasterImagesEventMap>> {
    const logger = useMasterImageService();
    const synchronizer = new MasterImageSynchronizerService();
    const queue = useMasterImageQueueService();

    return {
        $any: async (message) => {
            await logger.store({
                event: message.type,
                data: message.data,
            } as MasterImagesEventContext);
        },
        [MasterImagesEvent.SYNCHRONIZED]: async (
            message,
        ) => {
            // groups & images
            const output = await synchronizer
                .sync(message.data);

            const entities = [
                ...output.images.created,
                ...output.images.updated,
            ];

            for (let i = 0; i < entities.length; i++) {
                await queue.publishCommand({
                    command: MasterImagesCommand.BUILD,
                    data: {
                        id: entities[i].id,
                        path: entities[i].path,
                        virtualPath: entities[i].virtual_path,
                    },
                });
            }
        },
        [MasterImagesEvent.BUILT]: async (message) => {
            await queue.publishCommand({
                command: MasterImagesCommand.PUSH,
                data: {
                    id: message.data.id,
                    tags: message.data.tags,
                },
            });
        },
        [MasterImagesEvent.PUSH_FAILED]: async () => {
            // todo: clear built docker image
        },
    };
}
