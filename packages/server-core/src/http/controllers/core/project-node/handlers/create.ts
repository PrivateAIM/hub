/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NodeType, ProjectNodeApprovalStatus } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { ProjectEntity, ProjectNodeEntity } from '../../../../../domains';
import { runProjectNodeValidation } from '../utils';
import { useEnv } from '../../../../../config';

export async function createProjectNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({
        name: [
            PermissionName.PROJECT_CREATE,
            PermissionName.PROJECT_UPDATE,
        ],
    });

    const result = await runProjectNodeValidation(req, 'create');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProjectNodeEntity);
    let entity = repository.create(result.data);

    if (
        useEnv('skipProjectApproval') ||
        (result.relation.node && result.relation.node.type === NodeType.AGGREGATOR)
    ) {
        entity.approval_status = ProjectNodeApprovalStatus.APPROVED;
    }

    entity = await repository.save(entity);

    result.relation.project.nodes += 1;
    const projectRepository = dataSource.getRepository(ProjectEntity);
    await projectRepository.save(result.relation.project);

    return sendCreated(res, entity);
}
