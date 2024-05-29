/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BuilderErrorCode,
    BuilderEvent,
    ComponentName,
} from '@privateaim/server-analysis-manager-kit';
import type {
    BuilderBasePayload,
} from '@privateaim/server-analysis-manager-kit';
import {

    AnalysisBuildStatus,
} from '@privateaim/core';
import { isComponentError } from '@privateaim/server-kit';
import { useDataSource } from 'typeorm-extension';
import type { AnalysisLogSaveContext } from '../../domains';
import { AnalysisEntity, saveAnalysisLog } from '../../domains';

export async function handleAnalysisManagerBuilderBaseEvent(
    event: BuilderEvent,
    data: BuilderBasePayload,
) {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    const entity = await repository.findOneBy({ id: data.id });
    if (!entity) {
        return;
    }

    let trainLogContext : AnalysisLogSaveContext = {
        entity,
        component: ComponentName.BUILDER,
        event,
    };

    switch (event) {
        case BuilderEvent.NONE:
            if (!entity.run_status) {
                entity.build_status = null;
            }
            break;
        case BuilderEvent.BUILDING:
            entity.build_status = AnalysisBuildStatus.STARTED;

            trainLogContext.status = AnalysisBuildStatus.STARTED;
            break;
        case BuilderEvent.FAILED: {
            // todo: only in case of build, push event
            // entity.build_status = AnalysisBuildStatus.FAILED;

            if (isComponentError(data.error)) {
                trainLogContext = {
                    ...trainLogContext,
                    status: AnalysisBuildStatus.FAILED,
                    statusMessage: data.error.message,

                    error: true,
                    errorCode: data.error.code ?? BuilderErrorCode.UNKNOWN,
                };
            }

            break;
        }
        case BuilderEvent.PUSHED:
            entity.build_status = AnalysisBuildStatus.FINISHED;

            trainLogContext.status = AnalysisBuildStatus.FINISHED;
            break;
    }

    if (
        event !== BuilderEvent.FAILED &&
        event !== BuilderEvent.NONE
    ) {
        entity.run_status = null;
    }

    await repository.save(entity);

    await saveAnalysisLog(trainLogContext);
}
