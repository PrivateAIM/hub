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
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { AnalysisBucketFileEntity, AnalysisEntity } from '../../../../domains';
import { AnalysisBucketFileValidator } from '../utils';
import { HTTPHandlerOperation } from '../../constants';

export async function createAnalysisBucketFileRouteHandler(req: Request, res: Response) : Promise<any> {
    const validator = new AnalysisBucketFileValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    data.analysis_id = data.bucket.analysis_id;

    const dataSource = await useDataSource();
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: AnalysisEntity,
    });

    const repository = dataSource.getRepository(AnalysisBucketFileEntity);

    const identity = useRequestIdentityOrFail(req);
    data.realm_id = identity.realmId;

    switch (identity.type) {
        case 'user': {
            data.user_id = identity.id;
            break;
        }
        case 'robot': {
            data.robot_id = identity.id;
            break;
        }
        default: {
            throw new BadRequestError('Only user-/robot-accounts are permitted.');
        }
    }

    let entity = repository.create(data);

    if (data.bucket.type === AnalysisBucketType.CODE) {
        if (
            data.analysis.build_status &&
            data.analysis.build_status !== AnalysisBuildStatus.FAILED
        ) {
            throw new BadRequestError('The analysis has already been built and can no longer be modified.');
        }

        if (
            data.analysis.run_status &&
            data.analysis.run_status !== AnalysisRunStatus.FAILED
        ) {
            throw new BadRequestError('The analysis has already been started and can no longer be modified.');
        }
    }

    entity = await repository.save(entity);

    return sendCreated(res, entity);
}
