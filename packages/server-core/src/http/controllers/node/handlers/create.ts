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
import type { Request, Response } from 'routup';
import { sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { isQueueRouterUsable, useQueueRouter } from '@privateaim/server-kit';
import { RegistryCommand, buildRegistryTaskQueueRouterPayload } from '../../../../components';
import { createNodeRobot, runNodeValidation } from '../utils';
import { NodeEntity, RegistryEntity, RegistryProjectEntity } from '../../../../domains';

export async function createNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.NODE_CREATE });

    const result = await runNodeValidation(req, 'create');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(NodeEntity);

    const entity = repository.create(result.data);

    // -----------------------------------------------------

    let registryId : string | undefined;
    if (entity.registry_id) {
        registryId = entity.registry_id;
    } else {
        const registryRepository = dataSource.getRepository(RegistryEntity);
        // todo: default registry should be selected by unique identifying attribute
        const registries = await registryRepository.find({
            take: 1,
        });
        const [registry] = registries;
        if (registry) {
            registryId = entity.registry_id;
        }
    }

    if (registryId) {
        const registryProjectExternalName = entity.external_name || createNanoID();
        entity.external_name = registryProjectExternalName;

        const registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);
        const registryProject = registryProjectRepository.create({
            external_name: registryProjectExternalName,
            name: entity.name,
            type: RegistryProjectType.NODE,
            realm_id: entity.realm_id,
            registry_id: registryId,
            public: false,
        });

        await registryProjectRepository.save(registryProject);

        entity.registry_project_id = registryProject.id;

        if (isQueueRouterUsable()) {
            const queueRouter = useQueueRouter();
            await queueRouter.publish(buildRegistryTaskQueueRouterPayload({
                command: RegistryCommand.PROJECT_LINK,
                data: {
                    id: registryProject.id,
                },
            }));
        }
    }

    // -----------------------------------------------------

    await createNodeRobot(entity);

    // -----------------------------------------------------

    await repository.save(entity);

    return sendCreated(res, entity);
}
