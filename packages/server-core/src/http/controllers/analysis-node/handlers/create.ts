/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { AnalysisNodeApprovalStatus, NodeType } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { useEnv } from '../../../../config';
import { AnalysisEntity, AnalysisNodeEntity } from '../../../../domains';
import { runAnalysisNodeValidation } from '../utils';

export async function createAnalysisNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

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

    if (
        useEnv('skipAnalysisApproval') ||
        (result.relation.node && result.relation.node.type === NodeType.AGGREGATOR)
    ) {
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
