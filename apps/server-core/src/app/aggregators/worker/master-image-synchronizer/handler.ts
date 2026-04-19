/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MasterImageSynchronizerExecutionFinishedPayload,
} from '@privateaim/server-core-worker-kit';
import type { Logger } from '@privateaim/server-kit';
import type { DataSource } from 'typeorm';
import { MasterImageSynchronizerService } from '../../../../core/services/master-image/index.ts';
import { MasterImageEntity, MasterImageGroupEntity } from '../../../../adapters/database/index.ts';

export async function handleMasterImageSynchronizerExecutionFinishedEvent(
    value: MasterImageSynchronizerExecutionFinishedPayload,
    dataSource: DataSource,
    logger?: Logger,
) {
    const synchronizer = new MasterImageSynchronizerService({
        imageRepository: dataSource.getRepository(MasterImageEntity) as any,
        groupRepository: dataSource.getRepository(MasterImageGroupEntity) as any,
    });

    const output = await synchronizer
        .sync(value);

    logger?.info(`Created ${output.images.created.length} master images.`);
    logger?.info(`Deleted ${output.images.deleted.length} master images.`);
    logger?.info(`Updated ${output.images.updated.length} master images.`);
}
