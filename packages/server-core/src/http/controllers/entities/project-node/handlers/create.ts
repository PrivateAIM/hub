/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NodeType, ProjectNodeApprovalStatus } from '@privateaim/core-kit';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { HTTPHandlerOperation, useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { NotFoundError } from '@ebec/http';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { ProjectEntity, ProjectNodeEntity } from '../../../../../database/domains/index.ts';
import { RequestRepositoryAdapter } from '../../../../request/index.ts';
import { ProjectNodeValidator } from '../utils/index.ts';
import { useEnv } from '../../../../../config/index.ts';

export async function createProjectNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({
        name: [
            PermissionName.PROJECT_CREATE,
            PermissionName.PROJECT_UPDATE,
        ],
    });

    const validator = new ProjectNodeValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.CREATE,
    });

    const dataSource = await useDataSource();
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: ProjectNodeEntity,
    });

    data.project_realm_id = data.project.realm_id;
    data.node_realm_id = data.node.realm_id;

    if (!isRealmResourceWritable(useRequestIdentityRealm(req), data.project.realm_id)) {
        throw new NotFoundError('The referenced project realm is not permitted.');
    }

    const repository = dataSource.getRepository(ProjectNodeEntity);
    let entity = repository.create(data);

    if (
        useEnv('skipProjectApproval') ||
        (data.node.type === NodeType.AGGREGATOR)
    ) {
        entity.approval_status = ProjectNodeApprovalStatus.APPROVED;
    }

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    entity = await requestRepository.save(entity);

    data.project.nodes += 1;
    const projectRepository = dataSource.getRepository(ProjectEntity);
    await projectRepository.save(data.project);

    return sendCreated(res, entity);
}
