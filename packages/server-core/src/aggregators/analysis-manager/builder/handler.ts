/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisBuilderEvent,
} from '@privateaim/server-core-worker-kit';
import type {
    AnalysisBuilderBasePayload,
} from '@privateaim/server-core-worker-kit';
import {
    ProcessStatus,
} from '@privateaim/kit';
import { useDataSource } from 'typeorm-extension';
import { AnalysisEntity } from '../../../database';

export async function handleAnalysisManagerBuilderBaseEvent(
    event: AnalysisBuilderEvent,
    data: AnalysisBuilderBasePayload,
) {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    const entity = await repository.findOneBy({ id: data.id });
    if (!entity) {
        return;
    }

    switch (event) {
        case AnalysisBuilderEvent.NONE: {
            if (!entity.execution_status) {
                entity.build_status = null;
            }
            break;
        }
        case AnalysisBuilderEvent.EXECUTION_STARTED: {
            entity.build_status = ProcessStatus.STARTED;
            break;
        }
        case AnalysisBuilderEvent.EXECUTION_FAILED:
        case AnalysisBuilderEvent.CHECK_FAILED:
        case AnalysisBuilderEvent.PUSH_FAILED: {
            if (event !== AnalysisBuilderEvent.CHECK_FAILED) {
                entity.build_status = ProcessStatus.FAILED;
            }

            break;
        }
        case AnalysisBuilderEvent.PUSHED:
            entity.build_status = ProcessStatus.FINISHED;
            break;
    }

    await repository.save(entity);

    await repository.save(entity);
}
