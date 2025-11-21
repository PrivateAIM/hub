/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import type {
    AnalysisBuilderBasePayload, AnalysisBuilderCheckFinishedPayload,
    AnalysisBuilderEventMap,
} from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderEvent,
} from '@privateaim/server-core-worker-kit';
import type { ComponentHandlerContext } from '@privateaim/server-kit';
import { AnalysisEntity, useDataSourceSync } from '../../../database';

export async function handleAnalysisBuilderEvent(
    value: AnalysisBuilderBasePayload,
    context: ComponentHandlerContext<AnalysisBuilderEventMap>,
) {
    const dataSource = useDataSourceSync();
    const repository = dataSource.getRepository(AnalysisEntity);

    const entity = await repository.findOneBy({
        id: value.id,
    });

    if (!entity) {
        return;
    }

    switch (context.key) {
        case AnalysisBuilderEvent.EXECUTION_STARTED: {
            entity.build_status = ProcessStatus.STARTED;
            break;
        }
        case AnalysisBuilderEvent.CHECK_FAILED:
        case AnalysisBuilderEvent.EXECUTION_FAILED: {
            entity.build_status = ProcessStatus.FAILED;
            break;
        }
        case AnalysisBuilderEvent.EXECUTION_FINISHED: {
            entity.build_status = ProcessStatus.FINISHED;
            break;
        }
        case AnalysisBuilderEvent.CHECK_FINISHED: {
            const temp = value as AnalysisBuilderCheckFinishedPayload;
            if (temp.status) {
                entity.build_status = temp.status;
            }
        }
    }

    await repository.save(entity);
}
