/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, NotFoundError } from '@ebec/http';
import { AnalysisNodeApprovalStatus, DomainType, NodeType } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { HTTPHandlerOperation, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { isEventComponentServiceUsable, useEventComponentService } from '@privateaim/server-telemetry-kit';
import { useEnv } from '../../../../config';
import {
    AnalysisEntity, AnalysisNodeEntity, ProjectNodeEntity,
} from '../../../../database';
import { RequestRepositoryAdapter } from '../../../request';
import { AnalysisNodeValidator } from '../utils';

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
        entity.node.type === NodeType.AGGREGATOR
    ) {
        entity.approval_status = AnalysisNodeApprovalStatus.APPROVED;
    }

    await dataSource.transaction(async (entityManager) => {
        const analysisRepository = entityManager.getRepository(AnalysisEntity);
        await analysisRepository.createQueryBuilder()
            .update()
            .where({
                id: entity.analysis.id,
            })
            .set({
                nodes: () => '`nodes` + 1',
            })
            .execute();

        const repository = entityManager.getRepository(AnalysisNodeEntity);
        const requestRepository = new RequestRepositoryAdapter(
            req,
            repository,
        );

        entity = await requestRepository.save(entity);

        if (entity.run_status) {
            if (isEventComponentServiceUsable()) {
                const eventService = useEventComponentService();
                await eventService.command({
                    command: 'create',
                    data: {
                        ref_type: DomainType.ANALYSIS_NODE,
                        ref_id: entity.id,
                        name: entity.run_status,
                        scope: 'run',
                        data: {
                            analysis_id: data.analysis.id,
                            analysis_realm_id: data.analysis.realm_id,
                            node_id: data.node.id,
                            node_realm_id: data.node.realm_id,
                        },
                    },
                });
            }
        }
    });

    return sendCreated(res, entity);
}
