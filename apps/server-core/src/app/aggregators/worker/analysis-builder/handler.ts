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
            entity.buildStatus = ProcessStatus.STARTED;
            entity.buildProgress = 0;
            break;
        }
        case AnalysisBuilderEvent.EXECUTION_PROGRESS: {
            const temp = value as AnalysisBuilderExecutionProgressPayload;
            if (
                !entity.buildProgress ||
                temp.progress.percent >= entity.buildProgress
            ) {
                entity.buildProgress = Math.min(temp.progress.percent, 100);
            }
            break;
        }
        case AnalysisBuilderEvent.CHECK_FAILED: {
            // failure of the check itself says nothing about the build outcome
            return;
        }
        case AnalysisBuilderEvent.EXECUTION_FAILED: {
            entity.buildStatus = ProcessStatus.FAILED;
            break;
        }
        case AnalysisBuilderEvent.EXECUTION_FINISHED: {
            const temp = value as AnalysisBuilderExecutionFinishedPayload;

            entity.buildHash = temp.hash ?? null;
            entity.buildOs = temp.os ?? null;
            entity.buildSize = temp.size ?? null;
            entity.buildStatus = ProcessStatus.EXECUTED;
            entity.buildProgress = 100;
            break;
        }
        case AnalysisBuilderEvent.CHECK_FINISHED: {
            const temp = value as AnalysisBuilderCheckFinishedPayload;
            if (!temp.status) {
                return;
            }

            entity.buildStatus = temp.status;

            if (temp.status === ProcessStatus.EXECUTED) {
                entity.buildProgress = 100;
                entity.buildHash = temp.hash ?? entity.buildHash;
                entity.buildOs = temp.os ?? entity.buildOs;
                entity.buildSize = temp.size ?? entity.buildSize;
            } else if (temp.status === ProcessStatus.FAILED) {
                // the image is verifiably gone (e.g. docker daemon data loss) —
                // reset the build artifacts so the build can be retriggered.
                entity.buildProgress = 0;
                entity.buildHash = temp.hash ?? null;
                entity.buildOs = temp.os ?? null;
                entity.buildSize = temp.size ?? null;
            }
        }
    }

    await repository.save(entity);
}
