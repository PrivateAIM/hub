/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import type {
    MasterImagesEventMap,
} from '@privateaim/server-analysis-manager-kit';
import {
    MasterImagesCommand,
    MasterImagesEvent,
    useMasterImageQueueService,
} from '@privateaim/server-analysis-manager-kit';
import type { QueueRouterHandlers } from '@privateaim/server-kit';
import type { Event } from '@privateaim/telemetry-kit';
import { hasOwnProperty } from '@privateaim/kit';
import { isEventComponentServiceUsable, useEventComponentService } from '@privateaim/server-telemetry-kit';
import { MasterImageSynchronizerService } from '../../../services';

export function createAnalysisManagerMasterImagesHandlers() : QueueRouterHandlers<Partial<MasterImagesEventMap>> {
    const synchronizer = new MasterImageSynchronizerService();
    const queue = useMasterImageQueueService();

    // todo: refactor
    return {
        $any: async (message) => {
            const entity : Partial<Event> = {
                name: message.type,
                data: {},
                ref_type: DomainType.MASTER_IMAGE,
                scope: 'synchronization',
                expiring: true,
                expires_at: new Date(
                    Date.now() + (1000 * 60 * 60 * 24),
                ).toISOString(),
            };

            if (
                hasOwnProperty(message.data, 'id') &&
                typeof message.data.id === 'string'
            ) {
                entity.ref_id = message.data.id;
            }

            if (
                message.type === MasterImagesEvent.BUILD_FAILED ||
                message.type === MasterImagesEvent.PUSH_FAILED ||
                message.type === MasterImagesEvent.SYNCHRONIZATION_FAILED
            ) {
                entity.data = {
                    error: message.data.error,
                };
            }

            if (
                message.type === MasterImagesEvent.BUILT ||
                message.type === MasterImagesEvent.PUSHING ||
                message.type === MasterImagesEvent.PUSHED
            ) {
                entity.data = {
                    tags: message.data.tags,
                };
            }

            if (isEventComponentServiceUsable()) {
                const event = useEventComponentService();
                await event.command({
                    command: 'create',
                    data: entity,
                });
            }
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
