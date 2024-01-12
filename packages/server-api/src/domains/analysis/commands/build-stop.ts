/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { AnalysisBuildStatus } from '@personalhealthtrain/core';
import { useDataSource } from 'typeorm-extension';
import { resolveTrain } from './utils';
import { AnalysisEntity } from '../entity';

export async function stopBuildTrain(train: AnalysisEntity | string) : Promise<AnalysisEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    train = await resolveTrain(train, repository);

    if (train.run_status) {
        throw new BadRequestError('The train build can not longer be stopped...');
    } else {
        // if we already send a stop event, we dont send it again... :)
        if (train.build_status !== AnalysisBuildStatus.STOPPING) {
            // todo: implement stop routine
        }

        train = repository.merge(train, {
            build_status: train.build_status !== AnalysisBuildStatus.STOPPING ?
                AnalysisBuildStatus.STOPPING :
                AnalysisBuildStatus.STOPPED,
        });

        await repository.save(train);
    }

    return train;
}
