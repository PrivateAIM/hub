/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, NotFoundError } from '@ebec/http';
import { AnalysisNodeApprovalStatus, NodeType } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { useEnv } from '../../../../config';
import { AnalysisEntity, AnalysisNodeEntity, ProjectNodeEntity } from '../../../../domains';
import { AnalysisNodeValidator } from '../utils';
import { HTTPHandlerOperation } from '../../constants';

export async function createAnalysisNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.ANALYSIS_UPDATE });

    const validator = new AnalysisNodeValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const dataSource = await useDataSource();
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: AnalysisNodeEntity,
    });

    data.analysis_realm_id = data.analysis.realm_id;
    data.node_realm_id = data.node.realm_id;

    if (data.analysis.configuration_locked) {
        throw new BadRequestError('The analysis has already been locked and can therefore no longer be modified.');
    }

    const projectNodeRepository = dataSource.getRepository(ProjectNodeEntity);
    const projectNode = await projectNodeRepository.findOneBy({
        project_id: data.analysis.project_id,
        node_id: data.node_id,
    });

    if (!projectNode) {
        throw new NotFoundError('The referenced node is not part of the analysis project.');
    }

    const repository = dataSource.getRepository(AnalysisNodeEntity);

    let entity = repository.create(data);

    if (
        useEnv('skipAnalysisApproval') ||
        data.node.type === NodeType.AGGREGATOR
    ) {
        entity.approval_status = AnalysisNodeApprovalStatus.APPROVED;
    }

    if (!entity.index) {
        entity.index = await repository.countBy({
            analysis_id: entity.analysis_id,
        });
    }

    entity = await repository.save(entity);

    data.analysis.nodes += 1;
    const analysisRepository = dataSource.getRepository(AnalysisEntity);
    await analysisRepository.save(data.analysis);

    return sendCreated(res, entity);
}
