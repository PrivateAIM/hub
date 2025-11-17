/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import type {
    MasterImageSynchronizerExecutionFinishedPayload,
} from '@privateaim/server-core-worker-kit';
import { MasterImageBuilderComponentCaller } from '@privateaim/server-core-worker-kit';
import { useDataSource } from 'typeorm-extension';
import { MasterImageEntity } from '../../../database';
import { MasterImageSynchronizerService } from '../../../services';

export async function handleMasterImageSynchronizerExecutionFinishedEvent(value: MasterImageSynchronizerExecutionFinishedPayload) {
    const synchronizer = new MasterImageSynchronizerService();

    const output = await synchronizer
        .sync(value);

    const entities = [
        ...output.images.created,
        ...output.images.updated,
    ];

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(MasterImageEntity);

    const caller = new MasterImageBuilderComponentCaller();

    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        entity.build_status = ProcessStatus.STARTING;

        await repository.save(entity);
        await caller.callExecute({ id: entity.id });
    }
}
