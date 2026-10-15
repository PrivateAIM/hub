/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type {
    MasterImageBuilderBasePayload,
    MasterImageBuilderEventMap,
    MasterImageBuilderExecutionProgressPayload,
} from '@privateaim/server-core-worker-kit';
import {
    MasterImageBuilderEvent,
} from '@privateaim/server-core-worker-kit';
import type { ComponentHandlerContext } from '@privateaim/server-kit';
import type { EventComponentCaller } from '@privateaim/server-telemetry-kit';
import type { DataSource } from 'typeorm';
import { MasterImageEntity, updateLockedEntity } from '../../../../adapters/database/index.ts';
import { isProcessStatusTerminal } from '../helpers.ts';

export async function handleMasterImageBuilderEvent(
    value: MasterImageBuilderBasePayload,
    context: ComponentHandlerContext<MasterImageBuilderEventMap, MasterImageBuilderEvent>,
    dataSource: DataSource,
    eventComponentCaller?: EventComponentCaller,
) {
    // the whole read-check-mutate-save runs on the locked row, so a terminal
    // status is checked against the row as it is now, not as it was read
    // before a concurrent handler (another replica) committed.
    const saved = await updateLockedEntity(dataSource, MasterImageEntity, { id: value.id }, (entity) => {
        switch (context.key) {
            case MasterImageBuilderEvent.EXECUTION_STARTED: {
                if (isProcessStatusTerminal(entity.buildStatus)) {
                    return false;
                }

                entity.buildStatus = ProcessStatus.STARTED;
                entity.buildProgress = 0;
                break;
            }
            case MasterImageBuilderEvent.EXECUTION_PROGRESS: {
                if (isProcessStatusTerminal(entity.buildStatus)) {
                    return false;
                }

                const temp = value as MasterImageBuilderExecutionProgressPayload;

                if (
                    !entity.buildProgress ||
                    temp.progress.percent > entity.buildProgress
                ) {
                    entity.buildProgress = Math.min(temp.progress.percent, 100);
                }
                break;
            }
            case MasterImageBuilderEvent.EXECUTION_FAILED: {
                entity.buildStatus = ProcessStatus.FAILED;
                break;
            }
            case MasterImageBuilderEvent.EXECUTION_FINISHED: {
                entity.buildStatus = ProcessStatus.EXECUTED;
                entity.buildProgress = 100;
            }
        }

        return true;
    });

    if (!saved) {
        return;
    }

    if (eventComponentCaller) {
        await eventComponentCaller.callCreate({
            name: context.key,
            data: {},
            refType: DomainType.MASTER_IMAGE,
            refId: saved.id,
            scope: 'builder',
        });
    }
}
