/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core-kit';
import { PermissionID } from '@privateaim/core';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { ProjectNodeEntity } from '../../../../../domains';
import { useRequestEnv } from '@privateaim/server-http-kit';
import { runProjectNodeValidation } from '../utils';

export async function updateProjectNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProjectNodeEntity);
    let entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    const ability = useRequestEnv(req, 'abilities');

    const isAuthorityOfNode = isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.node_realm_id);
    const isAuthorizedForNode = ability.has(PermissionID.PROJECT_APPROVE);

    const isAuthorityOfProject = isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.project_realm_id);
    if (isAuthorityOfProject && !isAuthorityOfNode) {
        throw new ForbiddenError('Only permitted target node members can update this object.');
    }

    if (
        !isAuthorityOfNode ||
        !isAuthorizedForNode
    ) {
        throw new ForbiddenError('You are not permitted to update this object.');
    }

    const result = await runProjectNodeValidation(req, 'update');

    entity = repository.merge(entity, result.data);

    entity = await repository.save(entity);

    return sendAccepted(res, entity);
}
