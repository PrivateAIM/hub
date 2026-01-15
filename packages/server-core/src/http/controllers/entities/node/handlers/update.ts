/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    RegistryProjectType,
} from '@privateaim/core-kit';
import {
    PermissionName, createNanoID, isHex, isRealmResourceWritable,
} from '@privateaim/kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import type { Request, Response } from 'routup';
import { sendAccepted, useRequestParam } from 'routup';
import { useDataSource, validateEntityJoinColumns } from 'typeorm-extension';
import { HTTPHandlerOperation, useRequestIdentityRealm, useRequestPermissionChecker } from '@privateaim/server-http-kit';
import { RoutupContainerAdapter } from '@validup/adapter-routup';
import { RegistryCommand, useRegistryComponentCaller } from '../../../../../components/index.ts';
import { RequestRepositoryAdapter } from '../../../../request/index.ts';
import { NodeValidator } from '../utils/index.ts';
import { NodeEntity, RegistryProjectEntity } from '../../../../../database/index.ts';

export async function updateNodeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const permissionChecker = useRequestPermissionChecker(req);
    await permissionChecker.preCheck({ name: PermissionName.NODE_UPDATE });

    const validator = new NodeValidator();
    const validatorAdapter = new RoutupContainerAdapter(validator);
    const data = await validatorAdapter.run(req, {
        group: HTTPHandlerOperation.UPDATE,
    });

    const dataSource = await useDataSource();
    await validateEntityJoinColumns(data, {
        dataSource,
        entityTarget: NodeEntity,
    });

    if (
        data.public_key &&
        !isHex(data.public_key)
    ) {
        data.public_key = Buffer
            .from(data.public_key, 'utf8')
            .toString('hex');
    }

    const repository = dataSource.getRepository(NodeEntity);
    const query = repository.createQueryBuilder('node')
        .addSelect([
            'node.external_name',
        ])
        .where('node.id = :id', { id });

    let entity = await query.getOne();
    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestIdentityRealm(req), entity.realm_id)) {
        throw new ForbiddenError('You are not permitted to delete this station.');
    }

    entity = repository.merge(entity, data);

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

        const caller = useRegistryComponentCaller();
        if (registryOperation === 'link') {
            await caller.call(
                RegistryCommand.PROJECT_LINK,
                {
                    id: registryProject.id,
                },
                {},
            );
        } else {
            await caller.call(
                RegistryCommand.PROJECT_RELINK,
                {
                    id: registryProject.id,
                    registryId: registryProject.registry_id,
                    externalName: registryProject.external_name,
                    accountId: registryProject.account_id,
                },
                {},
            );
        }
    }

    // -----------------------------------------------------

    const requestRepository = new RequestRepositoryAdapter(
        req,
        repository,
    );

    await requestRepository.save(entity);

    return sendAccepted(res, entity);
}
