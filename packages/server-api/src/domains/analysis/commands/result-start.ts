/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { ExtractorCommand, buildExtractorQueuePayload } from '@personalhealthtrain/server-train-manager';
import { publish } from 'amqp-extension';
import {
    AnalysisContainerPath,
    AnalysisResultStatus,
    AnalysisRunStatus,
} from '@personalhealthtrain/core';
import { useDataSource } from 'typeorm-extension';
import { resolveTrain } from './utils';
import { AnalysisEntity } from '../entity';

export async function triggerTrainResultStart(
    train: string | AnalysisEntity,
) : Promise<AnalysisEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    train = await resolveTrain(train, repository);

    if (train.run_status !== AnalysisRunStatus.FINISHED) {
        throw new BadRequestError('The train has not finished yet...');
    }

    // send queue message
    await publish(buildExtractorQueuePayload({
        command: ExtractorCommand.EXTRACT,
        data: {
            id: train.id,

            filePaths: [
                AnalysisContainerPath.RESULTS,
                AnalysisContainerPath.CONFIG,
            ],
        },
    }));

    train = repository.merge(train, {
        result_status: AnalysisResultStatus.STARTED,
    });

    await repository.save(train);

    return train;
}
