/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    RegistryProjectType,
} from '@privateaim/core-kit';
import { PermissionName, createNanoID } from '@privateaim/kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { isRealmResourceWritable } from '@authup/core-kit';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { isQueueRouterUsable, useQueueRouter } from '@privateaim/server-kit';
import { RegistryCommand, buildRegistryTaskQueueRouterPayload } from '../../../../../components';
import { createNodeRobot, runNodeValidation } from '../utils';
import { NodeEntity, RegistryProjectEntity } from '../../../../../domains';

export async function updateNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.NODE_UPDATE });

    const result = await runNodeValidation(req, 'update');
    if (!result.data) {
        return sendAccepted(res);
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(NodeEntity);
    const query = repository.createQueryBuilder('station')
        .addSelect([
            'station.external_name',
        ])
        .where('station.id = :id', { id });

    let entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
        throw new ForbiddenError('You are not permitted to delete this station.');
    }

    entity = repository.merge(entity, result.data);

    if (entity.registry_id) {
        const registryProjectExternalName = entity.external_name || createNanoID();
        const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);

        let registryProject: RegistryProjectEntity | undefined;
        if (entity.registry_project_id) {
            registryProject = await registryProjectRepository.findOneBy({ id: entity.registry_project_id });
        }

        let registryOperation: 'link' | 'relink' = 'link';
        if (registryProject) {
            if (registryProject.external_name !== registryProjectExternalName) {
                registryProject = registryProjectRepository.merge(registryProject, {
                    external_name: registryProjectExternalName,
                    realm_id: entity.realm_id,
                });

                registryOperation = 'relink';
            }
        } else {
            registryProject = registryProjectRepository.create({
                external_name: registryProjectExternalName,
                name: entity.name,
                type: RegistryProjectType.NODE,
                realm_id: entity.realm_id,
                registry_id: entity.registry_id,
                public: false,
            });
        }

        await registryProjectRepository.save(registryProject);

        entity.registry_project_id = registryProject.id;
        entity.external_name = registryProjectExternalName;

        if (isQueueRouterUsable()) {
            const queueRouter = useQueueRouter();
            if (registryOperation === 'link') {
                await queueRouter.publish(buildRegistryTaskQueueRouterPayload({
                    command: RegistryCommand.PROJECT_LINK,
                    data: {
                        id: registryProject.id,
                    },
                }));
            } else {
                await queueRouter.publish(buildRegistryTaskQueueRouterPayload({
                    command: RegistryCommand.PROJECT_RELINK,
                    data: {
                        id: registryProject.id,
                        registryId: registryProject.registry_id,
                        externalName: registryProject.external_name,
                        accountId: registryProject.account_id,
                    },
                }));
            }
        }
    }

    await createNodeRobot(entity);

    await repository.save(entity);

    return sendAccepted(res, entity);
}
