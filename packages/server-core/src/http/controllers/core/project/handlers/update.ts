/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { isEntityUnique, useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '@privateaim/server-http-kit';
import { DatabaseConflictError } from '../../../../../database';
import { ProjectEntity } from '../../../../../domains';
import { runProjectValidation } from '../utils/validation';

export async function updateProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'abilities');
    if (!ability.has(PermissionName.PROJECT_UPDATE)) {
        throw new ForbiddenError();
    }

    const result = await runProjectValidation(req, 'update');
    if (!result.data) {
        return sendAccepted(res);
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProjectEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError();
    }

    entity = repository.merge(entity, result.data);

    const isUnique = await isEntityUnique({
        entity,
        entityTarget: ProjectEntity,
        entityExisting: entity,
        dataSource,
    });
    if (!isUnique) {
        throw new DatabaseConflictError();
    }

    await repository.save(entity);

    return sendAccepted(res, entity);
}
