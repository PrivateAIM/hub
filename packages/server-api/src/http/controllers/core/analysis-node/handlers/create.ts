/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, AnalysisNodeApprovalStatus } from '@personalhealthtrain/core';
import { BadRequestError, ForbiddenError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { AnalysisNodeEntity } from '../../../../../domains/anaylsis-node/entity';
import { useRequestEnv } from '../../../../request';
import { runTrainStationValidation } from '../utils';
import { useEnv } from '../../../../../config/env';
import { AnalysisEntity } from '../../../../../domains/analysis';

export async function createTrainStationRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.ANALYSIS_EDIT)) {
        throw new ForbiddenError();
    }

    const result = await runTrainStationValidation(req, 'create');

    if (useEnv('env') !== 'test' && !result.relation.node.ecosystem) {
        throw new BadRequestError('The referenced station must be assigned to an ecosystem.');
    }

    // todo: this should also work in the test-suite
    if (useEnv('env') !== 'test' && !result.relation.node.registry_id) {
        throw new BadRequestError('The referenced station must be assigned to a registry');
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisNodeEntity);

    let entity = repository.create(result.data);

    if (useEnv('skipTrainApprovalOperation')) {
        entity.approval_status = AnalysisNodeApprovalStatus.APPROVED;
    }

    if (!entity.index) {
        entity.index = await repository.countBy({
            analysis_id: entity.analysis_id,
        });
    }

    entity = await repository.save(entity);

    result.relation.analysis.nodes += 1;
    const trainRepository = dataSource.getRepository(AnalysisEntity);
    await trainRepository.save(result.relation.analysis);

    entity.analysis = result.relation.analysis;
    entity.node = result.relation.node;

    return sendCreated(res, entity);
}
