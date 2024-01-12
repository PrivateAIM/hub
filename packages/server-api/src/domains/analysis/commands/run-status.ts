/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { RouterCommand, buildRouterQueuePayload } from '@personalhealthtrain/server-train-manager';
import { publish } from 'amqp-extension';
import {
    AnalysisBuildStatus,
} from '@personalhealthtrain/core';
import type { AnalysisEntity } from '../entity';

export async function detectTrainRunStatus(train: AnalysisEntity) : Promise<AnalysisEntity> {
    if (
        train.build_status !== AnalysisBuildStatus.FINISHED
    ) {
        throw new BadRequestError('The train has not been build yet...');
    } else {
        await publish(buildRouterQueuePayload({
            command: RouterCommand.CHECK,
            data: {
                id: train.id,
            },
        }));
    }

    return train;
}
