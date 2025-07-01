/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { AnalysisAPICommand, AnalysisBuildStatus, isAnalysisAPICommandExecutable } from '@privateaim/core-kit';
import { useDataSource } from 'typeorm-extension';
import { AnalysisEntity } from '../entity';

export async function stopAnalysisBuild(entity: AnalysisEntity) : Promise<AnalysisEntity> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisEntity);

    const check = isAnalysisAPICommandExecutable(entity, AnalysisAPICommand.BUILD_STOP);
    if (!check.success) {
        throw new BadRequestError(check.message);
    }

    entity.build_status = entity.build_status !== AnalysisBuildStatus.STOPPING ?
        AnalysisBuildStatus.STOPPING :
        AnalysisBuildStatus.STOPPED;

    await repository.save(entity);

    return entity;
}
