/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BuilderEvent,
} from '@privateaim/server-core-worker-kit';
import type {
    BuilderBasePayload,
} from '@privateaim/server-core-worker-kit';
import {
    ProcessStatus,
} from '@privateaim/kit';
import { useDataSource } from 'typeorm-extension';
import { AnalysisEntity } from '../../../database';

export async function handleAnalysisManagerBuilderBaseEvent(
    event: BuilderEvent,
    data: BuilderBasePayload,
) {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    const entity = await repository.findOneBy({ id: data.id });
    if (!entity) {
        return;
    }

    switch (event) {
        case BuilderEvent.NONE: {
            if (!entity.execution_status) {
                entity.build_status = null;
            }
            break;
        }
        case BuilderEvent.BUILDING: {
            entity.build_status = ProcessStatus.STARTED;
            break;
        }
        case BuilderEvent.BUILD_FAILED:
        case BuilderEvent.CHECK_FAILED:
        case BuilderEvent.PUSH_FAILED: {
            if (event !== BuilderEvent.CHECK_FAILED) {
                entity.build_status = ProcessStatus.FAILED;
            }

            break;
        }
        case BuilderEvent.PUSHED:
            entity.build_status = ProcessStatus.FINISHED;
            break;
    }

    await repository.save(entity);

    await repository.save(entity);
}
