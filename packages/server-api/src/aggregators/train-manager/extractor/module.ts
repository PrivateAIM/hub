/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentContextWithError } from '@personalhealthtrain/server-core';
import { ComponentError, isComponentContextWithError } from '@personalhealthtrain/server-core';
import type {
    ExtractorEventContext,
} from '@personalhealthtrain/server-train-manager';
import {
    ComponentName, ExtractorCommand,
    ExtractorEvent,
} from '@personalhealthtrain/server-train-manager';
import {
    AnalysisBuildStatus,
    AnalysisResultStatus,
} from '@personalhealthtrain/core';
import { useDataSource } from 'typeorm-extension';
import { AnalysisEntity } from '../../../domains/analysis';
import type { AnalysisLogSaveContext } from '../../../domains/analysis-log';
import { saveAnalysisLog } from '../../../domains/analysis-log';

export async function handleTrainManagerExtractorEvent(
    context: ExtractorEventContext | ComponentContextWithError<ExtractorEventContext>,
) {
    const dataSource = await useDataSource();
    const trainRepository = dataSource.getRepository(AnalysisEntity);

    const entity = await trainRepository.findOneBy({ id: context.data.id });
    if (!entity) {
        return;
    }

    // -------------------------------------------------------------------------------

    let trainLogContext : AnalysisLogSaveContext = {
        train: entity,
        component: ComponentName.EXTRACTOR,
        command: context.command,
        event: context.event,
    };

    // -------------------------------------------------------------------------------

    let status : AnalysisResultStatus;

    switch (context.event) {
        case ExtractorEvent.DOWNLOADING:
            status = AnalysisResultStatus.DOWNLOADING;
            break;
        case ExtractorEvent.DOWNLOADED:
            status = AnalysisResultStatus.DOWNLOADED;
            break;
        case ExtractorEvent.EXTRACTING:
            status = AnalysisResultStatus.PROCESSING;
            break;
        case ExtractorEvent.EXTRACTED:
            status = AnalysisResultStatus.FINISHED;
            break;
        case ExtractorEvent.FAILED: {
            if (context.command === ExtractorCommand.EXTRACT) {
                status = AnalysisResultStatus.FAILED;
            }

            if (
                isComponentContextWithError(context) &&
                context.error instanceof ComponentError
            ) {
                trainLogContext = {
                    ...trainLogContext,
                    status: AnalysisBuildStatus.FAILED,
                    statusMessage: context.error.message,

                    error: true,
                    errorCode: `${context.error.code}`,
                    step: `${context.error.step}`,
                };
            }
            break;
        }
    }

    entity.result_status = status;

    await trainRepository.save(entity);

    await saveAnalysisLog({
        ...trainLogContext,
        status,
    });
}
