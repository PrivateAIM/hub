/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isEntityUnique, useDataSource } from 'typeorm-extension';
import { BadRequestError, ForbiddenError } from '@ebec/http';
import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useRequestEnv, useRequestIdentityOrFail, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { DatabaseConflictError } from '../../../../../database';
import { ProjectEntity } from '../../../../../domains';
import { runProjectValidation } from '../utils/validation';

export async function createProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.PROJECT_CREATE });

    const result = await runProjectValidation(req, 'create');

    const identity = useRequestIdentityOrFail(req);
    switch (identity.type) {
        case 'user': {
            result.data.user_id = identity.id;
            break;
        }
        case 'robot': {
            result.data.robot_id = identity.id;
            break;
        }
        default: {
            throw new BadRequestError('Only user-/robot-accounts are permitted to create a project');
        }
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProjectEntity);
    const entity = repository.create(result.data);

    const isUnique = await isEntityUnique({
        entity,
        entityTarget: ProjectEntity,
        dataSource,
    });
    if (!isUnique) {
        throw new DatabaseConflictError();
    }

    await repository.save(entity);

    return sendCreated(res, entity);
}
