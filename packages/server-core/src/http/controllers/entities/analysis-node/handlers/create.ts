/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, NotFoundError } from '@ebec/http';
import { AnalysisNodeApprovalStatus, DomainType, NodeType } from '@privateaim/core-kit';
import { MONTH_IN_MS, PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { HTTPHandlerOperation, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { isEventComponentCallerUsable, useEventComponentCaller } from '@privateaim/server-telemetry-kit';
import { useEnv } from '../../../../../config/index.ts';
import {
    AnalysisNodeEntity, ProjectNodeEntity,
} from '../../../../../database/index.ts';
import { RequestRepositoryAdapter } from '../../../../request/index.ts';
import { AnalysisNodeValidator } from '../utils/index.ts';

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

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    entity = await requestRepository.save(entity);

    if (entity.execution_status) {
        if (isEventComponentCallerUsable()) {
            const eventService = useEventComponentCaller();
            await eventService.callCreate({
                ref_type: DomainType.ANALYSIS_NODE,
                ref_id: entity.id,
                name: entity.execution_status,
                scope: 'run',
                data: {

                    analysis_id: data.analysis.id,
                    analysis_realm_id: data.analysis.realm_id,
                    node_id: data.node.id,
                    node_realm_id: data.node.realm_id,
                    execution_progress: data.execution_progress,
                },
                expiring: true,
                expires_at: new Date(Date.now() + MONTH_IN_MS).toISOString(),
            });
        }
    }

    return sendCreated(res, entity);
}
