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
import { AnalysisEntity, updateLockedEntity } from '../../../../adapters/database/index.ts';
import { isCheckVerdictStale, isProcessStatusTerminal } from '../helpers.ts';

export async function handleAnalysisBuilderEvent(
    value: AnalysisBuilderBasePayload,
    context: ComponentHandlerContext<AnalysisBuilderEventMap>,
    dataSource: DataSource,
) {
    // the whole read-check-mutate-save runs on the locked row, so a terminal
    // status is checked against the row as it is now, not as it was read
    // before a concurrent handler (another replica) committed.
    await updateLockedEntity(dataSource, AnalysisEntity, { id: value.id }, (entity) => {
        switch (context.key) {
            case AnalysisBuilderEvent.EXECUTION_STARTED: {
                if (isProcessStatusTerminal(entity.buildStatus)) {
                    return false;
                }

                entity.buildStatus = ProcessStatus.STARTED;
                entity.buildProgress = 0;
                break;
            }
            case AnalysisBuilderEvent.EXECUTION_PROGRESS: {
                if (isProcessStatusTerminal(entity.buildStatus)) {
                    return false;
                }

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
                return false;
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
                if (!temp.status || isCheckVerdictStale(temp.checkedAt, entity.updatedAt)) {
                    return false;
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

        return true;
    });
}
