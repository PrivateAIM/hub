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
import { MasterImageEntity } from '../../../../adapters/database/index.ts';

export async function handleMasterImageBuilderEvent(
    value: MasterImageBuilderBasePayload,
    context: ComponentHandlerContext<MasterImageBuilderEventMap, MasterImageBuilderEvent>,
    dataSource: DataSource,
    eventComponentCaller?: EventComponentCaller,
) {
    const repository = dataSource.getRepository(MasterImageEntity);

    const entity = await repository.findOneBy({ id: value.id });

    if (!entity) {
        return;
    }

    switch (context.key) {
        case MasterImageBuilderEvent.EXECUTION_STARTED: {
            entity.build_status = ProcessStatus.STARTED;
            entity.build_progress = 0;
            break;
        }
        case MasterImageBuilderEvent.EXECUTION_PROGRESS: {
            const temp = value as MasterImageBuilderExecutionProgressPayload;

            if (
                !entity.build_progress ||
                temp.progress.percent > entity.build_progress
            ) {
                entity.build_progress = temp.progress.percent;
            }
            break;
        }
        case MasterImageBuilderEvent.EXECUTION_FAILED: {
            entity.build_status = ProcessStatus.FAILED;
            break;
        }
        case MasterImageBuilderEvent.EXECUTION_FINISHED: {
            entity.build_status = ProcessStatus.EXECUTED;
            entity.build_progress = 100;
        }
    }

    await repository.save(entity);

    if (eventComponentCaller) {
        await eventComponentCaller.callCreate({
            name: context.key,
            data: {},
            ref_type: DomainType.MASTER_IMAGE,
            ref_id: entity.id,
            scope: 'builder',
            expiring: true,
            expires_at: new Date(
                Date.now() + (1000 * 60 * 60 * 24),
            ).toISOString(),
        });
    }
}
