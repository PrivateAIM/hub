/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
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
import type { Event } from '@privateaim/telemetry-kit';
import { useEventComponentService } from '@privateaim/server-telemetry';
import { hasOwnProperty } from '@privateaim/kit';
import { MasterImageSynchronizerService } from '../../../services';

export function createAnalysisManagerMasterImagesHandlers() : QueueRouterHandlers<Partial<MasterImagesEventMap>> {
    const event = useEventComponentService();
    const synchronizer = new MasterImageSynchronizerService();
    const queue = useMasterImageQueueService();

    return {
        $any: async (message) => {
            const data = message.data as MasterImagesEventContext;

            const entity : Partial<Event> = {
                name: data.event,
                data,
                ref_type: DomainType.MASTER_IMAGE,
            };

            if (
                hasOwnProperty(data, 'id') &&
                typeof data.id === 'string'
            ) {
                entity.ref_id = data.id;
            }

            if (
                data.event === MasterImagesEvent.BUILD_FAILED ||
                data.event === MasterImagesEvent.PUSH_FAILED ||
                data.event === MasterImagesEvent.SYNCHRONIZATION_FAILED
            ) {
                entity.data = {
                    error: data.data.error,
                };
            }

            if (
                data.event === MasterImagesEvent.BUILT ||
                data.event === MasterImagesEvent.PUSHING ||
                data.event === MasterImagesEvent.PUSHED
            ) {
                entity.data = {
                    tags: data.data.tags,
                };
            }

            if (
                entity.expiring &&
                !entity.expires_at
            ) {
                entity.expires_at = new Date(
                    Date.now() + (1000 * 60 * 60 * 24),
                ).toISOString();
            }

            await event.command({
                command: 'create',
                data: entity,
            });
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
