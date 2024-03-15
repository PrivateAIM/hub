/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { BadRequestError } from '@ebec/http';
import { AnalysisBuildStatus, AnalysisFileType, AnalysisRunStatus } from '@privateaim/core';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { AnalysisFileEntity } from '../../../../../domains';
import { runAnalysisFileValidation } from '../utils';

export async function createAnalysisFileRouteHandler(req: Request, res: Response) : Promise<any> {
    const result = await runAnalysisFileValidation(req, 'create');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisFileEntity);

    let entity = repository.create(result.data);

    if (
        entity.type === AnalysisFileType.CODE &&
        result.relation.analysis
    ) {
        if (
            result.relation.analysis.build_status &&
            result.relation.analysis.build_status !== AnalysisBuildStatus.FAILED
        ) {
            throw new BadRequestError('The analysis has already been built and can no longer be modified.');
        }

        if (
            result.relation.analysis.run_status &&
            result.relation.analysis.run_status !== AnalysisRunStatus.FAILED
        ) {
            throw new BadRequestError('The analysis has already been started and can no longer be modified.');
        }
    }

    entity = await repository.save(entity);

    return sendCreated(res, entity);
}
