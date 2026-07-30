/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import type {
    AnalysisDistributorBasePayload,
    AnalysisDistributorCheckFinishedPayload,
    AnalysisDistributorEventMap,
    AnalysisDistributorExecutionProgressPayload,
} from '@privateaim/server-core-worker-kit';
import {
    AnalysisDistributorEvent,
} from '@privateaim/server-core-worker-kit';
import type { ComponentHandlerContext } from '@privateaim/server-kit';
import type { DataSource } from 'typeorm';
import { AnalysisEntity } from '../../../../adapters/database/index.ts';

export async function handleAnalysisDistributorEvent(
    value: AnalysisDistributorBasePayload,
    context: ComponentHandlerContext<AnalysisDistributorEventMap>,
    dataSource: DataSource,
) {
    const repository = dataSource.getRepository(AnalysisEntity);
    const entity = await repository.findOneBy({ id: value.id });

    if (!entity) {
        return;
    }

    switch (context.key) {
        case AnalysisDistributorEvent.EXECUTION_STARTED: {
            entity.distributionStatus = ProcessStatus.STARTED;
            entity.distributionProgress = 0;
            break;
        }
        case AnalysisDistributorEvent.EXECUTION_PROGRESS: {
            const temp = value as AnalysisDistributorExecutionProgressPayload;
            if (
                !entity.distributionProgress ||
                temp.progress.percent >= entity.distributionProgress
            ) {
                entity.distributionProgress = Math.min(temp.progress.percent, 100);
            }
            break;
        }
        case AnalysisDistributorEvent.CHECK_FAILED: {
            // failure of the check itself says nothing about the distribution outcome
            return;
        }
        case AnalysisDistributorEvent.EXECUTION_FAILED: {
            entity.distributionStatus = ProcessStatus.FAILED;
            break;
        }
        case AnalysisDistributorEvent.EXECUTION_FINISHED: {
            entity.distributionStatus = ProcessStatus.EXECUTED;
            entity.distributionProgress = 100;
            break;
        }
        case AnalysisDistributorEvent.CHECK_FINISHED: {
            const temp = value as AnalysisDistributorCheckFinishedPayload;
            if (!temp.status) {
                return;
            }

            entity.distributionStatus = temp.status;

            if (temp.status === ProcessStatus.EXECUTED) {
                entity.distributionProgress = 100;
            } else if (temp.status === ProcessStatus.FAILED) {
                entity.distributionProgress = 0;
            }
        }
    }

    await repository.save(entity);
}
