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
            entity.distribution_status = ProcessStatus.STARTED;
            entity.distribution_progress = 0;
            break;
        }
        case AnalysisDistributorEvent.EXECUTION_PROGRESS: {
            const temp = value as AnalysisDistributorExecutionProgressPayload;
            if (
                !entity.distribution_progress ||
                temp.progress.percent >= entity.distribution_progress
            ) {
                entity.distribution_progress = Math.min(temp.progress.percent, 100);
            }
            break;
        }
        case AnalysisDistributorEvent.CHECK_FAILED:
        case AnalysisDistributorEvent.EXECUTION_FAILED: {
            entity.distribution_status = ProcessStatus.FAILED;
            break;
        }
        case AnalysisDistributorEvent.EXECUTION_FINISHED: {
            entity.distribution_status = ProcessStatus.EXECUTED;
            entity.distribution_progress = 100;
            break;
        }
        case AnalysisDistributorEvent.CHECK_FINISHED: {
            const temp = value as AnalysisDistributorCheckFinishedPayload;
            if (temp.status) {
                entity.distribution_progress = temp.status === ProcessStatus.EXECUTED ?
                    100 :
                    0;
            }

            entity.distribution_status = temp.status || null;
        }
    }

    await repository.save(entity);
}
