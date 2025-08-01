/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { ProjectEntity } from '../../../../database';
import { RequestRepositoryAdapter } from '../../../request';

export async function deleteProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.PROJECT_DELETE });

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ProjectEntity);
    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
        throw new ForbiddenError();
    }

    if (entity.analyses > 0) {
        throw new BadRequestError('Remove all trains associated to the proposal before removing it.');
    }

    const { id: entityId } = entity;

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );
    await requestRepository.remove(entity);

    entity.id = entityId;

    return sendAccepted(res, entity);
}
