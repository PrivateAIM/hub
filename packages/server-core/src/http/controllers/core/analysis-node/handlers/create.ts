/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AnalysisNodeApprovalStatus, PermissionID } from '@privateaim/core';
import { BadRequestError, ForbiddenError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { AnalysisEntity, AnalysisNodeEntity } from '../../../../../domains';
import { useRequestEnv } from '../../../../request';
import { runAnalysisNodeValidation } from '../utils';
import { useEnv } from '../../../../../config';

export async function createAnalysisNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.ANALYSIS_EDIT)) {
        throw new ForbiddenError();
    }

    const result = await runAnalysisNodeValidation(req, 'create');
    if (
        result.relation.analysis &&
        result.relation.analysis.configuration_locked
    ) {
        throw new BadRequestError('The analysis is locked right now. It is not possible to add new nodes.');
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(AnalysisNodeEntity);

    let entity = repository.create(result.data);

    if (useEnv('skipAnalysisApproval')) {
        entity.approval_status = AnalysisNodeApprovalStatus.APPROVED;
    }

    if (!entity.index) {
        entity.index = await repository.countBy({
            analysis_id: entity.analysis_id,
        });
    }

    entity = await repository.save(entity);

    result.relation.analysis.nodes += 1;
    const analysisRepository = dataSource.getRepository(AnalysisEntity);
    await analysisRepository.save(result.relation.analysis);

    entity.analysis = result.relation.analysis;
    entity.node = result.relation.node;

    return sendCreated(res, entity);
}
