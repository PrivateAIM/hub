/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NodeType, ProjectNodeApprovalStatus } from '@privateaim/core-kit';
import { ForbiddenError } from '@ebec/http';
import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '@privateaim/server-http-kit';
import { ProjectNodeEntity } from '../../../../../domains';
import { runProjectNodeValidation } from '../utils';
import { useEnv } from '../../../../../config';

export async function createProjectNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'abilities');

    if (
        !ability.has(PermissionName.PROJECT_UPDATE) &&
        !ability.has(PermissionName.PROJECT_CREATE)
    ) {
        throw new ForbiddenError('You are not allowed to add a project node.');
    }

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

    return sendCreated(res, entity);
}
