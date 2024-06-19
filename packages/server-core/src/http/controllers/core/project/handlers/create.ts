/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID } from '@privateaim/core-kit';
import { ForbiddenError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '@privateaim/server-http-kit';
import { ProjectEntity } from '../../../../../domains';
import { runProjectValidation } from '../utils/validation';

export async function createProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'abilities');
    if (!ability.has(PermissionID.PROJECT_ADD)) {
        throw new ForbiddenError();
    }

    const result = await runProjectValidation(req, 'create');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProjectEntity);
    const entity = repository.create({
        user_id: useRequestEnv(req, 'userId'),
        ...result.data,
    });

    await repository.save(entity);

    return sendCreated(res, entity);
}
