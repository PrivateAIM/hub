/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageGroup } from '@privateaim/core-kit';
import type {
    MasterImageSynchronizerExecutionFinishedPayload,
} from '@privateaim/server-core-worker-kit';
import type { IEntityRepository, Logger } from '@privateaim/server-kit';
import type { IMasterImageRepository } from '../../../../core/entities/master-image/types.ts';
import { MasterImageSynchronizerService } from '../../../../core/services/master-image/index.ts';

export async function handleMasterImageSynchronizerExecutionFinishedEvent(
    value: MasterImageSynchronizerExecutionFinishedPayload,
    imageRepository: IMasterImageRepository,
    groupRepository: IEntityRepository<MasterImageGroup>,
    logger?: Logger,
) {
    const synchronizer = new MasterImageSynchronizerService({
        imageRepository,
        groupRepository,
    });

    const output = await synchronizer
        .sync(value);

    logger?.info(`Created ${output.images.created.length} master images.`);
    logger?.info(`Deleted ${output.images.deleted.length} master images.`);
    logger?.info(`Updated ${output.images.updated.length} master images.`);
}
