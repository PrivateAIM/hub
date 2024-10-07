/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { BadRequestError } from '@ebec/http';
import {
    AnalysisBucketType, AnalysisBuildStatus, AnalysisRunStatus,
} from '@privateaim/core-kit';
import { useRequestIdentityOrFail } from '@privateaim/server-http-kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { AnalysisBucketFileEntity } from '../../../../../domains';
import { runAnalysisFileValidation } from '../utils';

export async function createAnalysisBucketFileRouteHandler(req: Request, res: Response) : Promise<any> {
    const result = await runAnalysisFileValidation(req, 'create');
    result.data.analysis_id = result.relation.bucket.analysis_id;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisBucketFileEntity);

    const identity = useRequestIdentityOrFail(req);
    result.data.realm_id = identity.realmId;

    switch (identity.type) {
        case 'user': {
            result.data.user_id = identity.id;
            break;
        }
        case 'robot': {
            result.data.robot_id = identity.id;
            break;
        }
        default: {
            throw new BadRequestError('Only user-/robot-accounts are permitted.');
        }
    }

    let entity = repository.create(result.data);

    if (
        result.relation.bucket.type === AnalysisBucketType.CODE &&
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
