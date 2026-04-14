/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MasterImageSynchronizerExecutionFinishedPayload,
} from '@privateaim/server-core-worker-kit';
import { useLogger } from '@privateaim/server-kit';
import { useDataSource } from 'typeorm-extension';
import { MasterImageSynchronizerService } from '../../../../core/services/master-image/index.ts';
import { MasterImageEntity, MasterImageGroupEntity } from '../../../../adapters/database/index.ts';

export async function handleMasterImageSynchronizerExecutionFinishedEvent(value: MasterImageSynchronizerExecutionFinishedPayload) {
    const dataSource = await useDataSource();
    const synchronizer = new MasterImageSynchronizerService({
        imageRepository: dataSource.getRepository(MasterImageEntity) as any,
        groupRepository: dataSource.getRepository(MasterImageGroupEntity) as any,
    });

    const output = await synchronizer
        .sync(value);

    useLogger().info(`Created ${output.images.created.length} master images.`);
    useLogger().info(`Deleted ${output.images.deleted.length} master images.`);
    useLogger().info(`Updated ${output.images.updated.length} master images.`);
}
