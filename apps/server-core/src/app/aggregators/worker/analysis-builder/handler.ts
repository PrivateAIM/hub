/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import type {
    AnalysisBuilderBasePayload,
    AnalysisBuilderCheckFinishedPayload,
    AnalysisBuilderEventMap,
    AnalysisBuilderExecutionFinishedPayload,
    AnalysisBuilderExecutionProgressPayload,
} from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderEvent,
} from '@privateaim/server-core-worker-kit';
import type { ComponentHandlerContext } from '@privateaim/server-kit';
import type { DataSource } from 'typeorm';
import { AnalysisEntity } from '../../../../adapters/database/index.ts';

export async function handleAnalysisBuilderEvent(
    value: AnalysisBuilderBasePayload,
    context: ComponentHandlerContext<AnalysisBuilderEventMap>,
    dataSource: DataSource,
) {
    const repository = dataSource.getRepository(AnalysisEntity);

    const entity = await repository.findOneBy({ id: value.id });

    if (!entity) {
        return;
    }

    switch (context.key) {
        case AnalysisBuilderEvent.EXECUTION_STARTED: {
            entity.build_status = ProcessStatus.STARTED;
            entity.build_progress = 0;
            break;
        }
        case AnalysisBuilderEvent.EXECUTION_PROGRESS: {
            const temp = value as AnalysisBuilderExecutionProgressPayload;
            if (
                !entity.build_progress ||
                temp.progress.percent >= entity.build_progress
            ) {
                entity.build_progress = Math.min(temp.progress.percent, 100);
            }
            break;
        }
        case AnalysisBuilderEvent.CHECK_FAILED:
        case AnalysisBuilderEvent.EXECUTION_FAILED: {
            entity.build_status = ProcessStatus.FAILED;
            break;
        }
        case AnalysisBuilderEvent.EXECUTION_FINISHED: {
            const temp = value as AnalysisBuilderExecutionFinishedPayload;

            entity.build_hash = temp.hash ?? null;
            entity.build_os = temp.os ?? null;
            entity.build_size = temp.size != null ? Math.min(temp.size, 2147483647) : null;
            entity.build_status = ProcessStatus.EXECUTED;
            entity.build_progress = 100;
            break;
        }
        case AnalysisBuilderEvent.CHECK_FINISHED: {
            const temp = value as AnalysisBuilderCheckFinishedPayload;
            if (temp.status) {
                entity.build_progress = temp.status === ProcessStatus.EXECUTED ?
                    100 :
                    0;
            }

            entity.build_hash = temp.hash ?? null;
            entity.build_os = temp.os ?? null;
            entity.build_size = temp.size != null ? Math.min(temp.size, 2147483647) : null;
            entity.build_status = temp.status || null;
        }
    }

    await repository.save(entity);
}
