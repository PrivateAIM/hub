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
import { AnalysisEntity, updateLockedEntity } from '../../../../adapters/database/index.ts';
import { isCheckVerdictStale, isProcessStatusTerminal } from '../helpers.ts';

export async function handleAnalysisDistributorEvent(
    value: AnalysisDistributorBasePayload,
    context: ComponentHandlerContext<AnalysisDistributorEventMap>,
    dataSource: DataSource,
) {
    // the whole read-check-mutate-save runs on the locked row, so a terminal
    // status is checked against the row as it is now, not as it was read
    // before a concurrent handler (another replica) committed.
    await updateLockedEntity(dataSource, AnalysisEntity, { id: value.id }, (entity) => {
        switch (context.key) {
            case AnalysisDistributorEvent.EXECUTION_STARTED: {
                if (isProcessStatusTerminal(entity.distributionStatus)) {
                    return false;
                }

                entity.distributionStatus = ProcessStatus.STARTED;
                entity.distributionProgress = 0;
                break;
            }
            case AnalysisDistributorEvent.EXECUTION_PROGRESS: {
                if (isProcessStatusTerminal(entity.distributionStatus)) {
                    return false;
                }

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
                return false;
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
                if (!temp.status || isCheckVerdictStale(temp.checkedAt, entity.updatedAt)) {
                    return false;
                }

                entity.distributionStatus = temp.status;

                if (temp.status === ProcessStatus.EXECUTED) {
                    entity.distributionProgress = 100;
                } else if (temp.status === ProcessStatus.FAILED) {
                    entity.distributionProgress = 0;
                }
            }
        }

        return true;
    });
}
