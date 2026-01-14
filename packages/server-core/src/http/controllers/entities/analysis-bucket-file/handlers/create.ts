/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { BadRequestError } from '@ebec/http';
import {
    AnalysisBucketType,
} from '@privateaim/core-kit';
import { HTTPHandlerOperation, useRequestIdentityOrFail } from '@privateaim/server-http-kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { AnalysisBucketFileEntity, AnalysisEntity } from '../../../../../database/index.ts';
import { RequestRepositoryAdapter } from '../../../../request/index.ts';
import { AnalysisBucketFileValidator } from '../utils/index.ts';

export async function createAnalysisBucketFileRouteHandler(req: Request, res: Response) : Promise<any> {
    const validator = new AnalysisBucketFileValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const dataSource = await useDataSource();
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: AnalysisBucketFileEntity,
    });

    data.analysis_id = data.analysis_bucket.analysis_id;

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

    if (entity.analysis_bucket.type === AnalysisBucketType.CODE) {
        const analysisRepository = dataSource.getRepository(AnalysisEntity);
        const analysis = await analysisRepository.findOne({
            where: {
                id: entity.analysis_id,
            },
        });

        if (analysis.configuration_locked) {
            throw new BadRequestError('The analysis has already been locked and can therefore no longer be modified.');
        }
    }

    if (entity.root) {
        await repository.update({
            analysis_bucket_id: entity.analysis_bucket_id,
            analysis_id: entity.analysis_id,
        }, {
            root: false,
        });
    }

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    entity = await requestRepository.save(entity);

    return sendCreated(res, entity);
}
