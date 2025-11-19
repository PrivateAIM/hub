/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { RegistryCommand, useRegistryComponentCaller } from '../../../../components';
import { NodeEntity, RegistryProjectEntity } from '../../../../database';
import { RequestRepositoryAdapter } from '../../../request';

export async function deleteNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.NODE_DELETE });

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(NodeEntity);

    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
        throw new ForbiddenError('You are not permitted to delete this station.');
    }

    if (entity.registry_project_id) {
        const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);

        const registryProject = await registryProjectRepository.findOneBy({ id: entity.registry_project_id });
        if (registryProject) {
            const caller = useRegistryComponentCaller();
            await caller.call(
                RegistryCommand.PROJECT_UNLINK,
                {
                    id: registryProject.id,
                    registryId: registryProject.registry_id,
                    externalName: registryProject.external_name,
                    accountId: registryProject.account_id,
                },
                {},
            );

            await registryProjectRepository.remove(registryProject);
        }
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
