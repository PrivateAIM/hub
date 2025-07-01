/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BuilderCommand,
    BuilderErrorCode,
    BuilderEvent,
    ComponentName,
} from '@privateaim/server-analysis-manager-kit';
import type {
    BuilderBasePayload,
} from '@privateaim/server-analysis-manager-kit';
import {

    AnalysisBuildStatus,
} from '@privateaim/core-kit';
import { isComponentError } from '@privateaim/server-kit';
import { useDataSource } from 'typeorm-extension';
import type { AnalysisLogSaveContext } from '../../../database/domains';
import { AnalysisEntity, saveAnalysisLog } from '../../../database/domains';

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

    let logCtx : AnalysisLogSaveContext = {
        analysisId: entity.id,
        realmId: entity.realm_id,
        component: ComponentName.BUILDER,
        event,
    };

    switch (event) {
        case BuilderEvent.NONE: {
            if (!entity.run_status) {
                entity.build_status = null;
            }

            logCtx.command = BuilderCommand.CHECK;
            break;
        }
        case BuilderEvent.BUILDING: {
            entity.build_status = AnalysisBuildStatus.STARTED;

            logCtx.command = BuilderCommand.BUILD;
            logCtx.status = AnalysisBuildStatus.STARTED;
            break;
        }
        case BuilderEvent.BUILD_FAILED:
        case BuilderEvent.CHECK_FAILED:
        case BuilderEvent.PUSH_FAILED: {
            if (event !== BuilderEvent.CHECK_FAILED) {
                entity.build_status = AnalysisBuildStatus.FAILED;
            }

            if (isComponentError(data.error)) {
                logCtx = {
                    ...logCtx,
                    status: AnalysisBuildStatus.FAILED,
                    statusMessage: data.error.message,

                    error: true,
                    errorCode: data.error.code ?? BuilderErrorCode.UNKNOWN,
                };
            }

            switch (event) {
                case BuilderEvent.BUILD_FAILED:
                    logCtx.command = BuilderCommand.BUILD;
                    break;
                case BuilderEvent.CHECK_FAILED:
                    logCtx.command = BuilderCommand.CHECK;
                    break;
                case BuilderEvent.PUSH_FAILED:
                    logCtx.command = BuilderCommand.PUSH;
                    break;
            }

            break;
        }
        case BuilderEvent.PUSHED:
            entity.build_status = AnalysisBuildStatus.FINISHED;

            logCtx.status = AnalysisBuildStatus.FINISHED;
            logCtx.command = BuilderCommand.PUSH;
            break;
    }

    await repository.save(entity);

    await saveAnalysisLog(logCtx);
}
