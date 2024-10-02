/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isEntityUnique, useDataSource } from 'typeorm-extension';
import { ForbiddenError } from '@ebec/http';
import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useRequestEnv } from '@privateaim/server-http-kit';
import { DatabaseConflictError } from '../../../../../database';
import { ProjectEntity } from '../../../../../domains';
import { runProjectValidation } from '../utils/validation';

export async function createProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'abilities');
    if (!ability.has(PermissionName.PROJECT_CREATE)) {
        throw new ForbiddenError();
    }

    const result = await runProjectValidation(req, 'create');

    const userId = useRequestEnv(req, 'userId');
    if (userId) {
        result.data.user_id = userId;
    }

    const robotId = useRequestEnv(req, 'robotId');
    if (robotId) {
        result.data.robot_id = robotId;
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
