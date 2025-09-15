/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME,
    RegistryProjectType, generateRegistryProjectId,
} from '@privateaim/core-kit';
import { useDataSource } from 'typeorm-extension';
import { useLogger, useQueueRouter } from '@privateaim/server-kit';
import { RegistryEntity, RegistryProjectEntity } from '../../../database/domains';
import { RegistryCommand } from '../constants';
import type { RegistrySetupPayload } from '../type';
import { buildRegistryTaskQueueRouterPayload } from '../utils';

export async function setupRegistry(payload: RegistrySetupPayload) {
    if (!payload.id) {
        useLogger()
            .warn('No registry specified.', {
                component: 'registry',
                command: RegistryCommand.SETUP,
            });
        return payload;
    }

    // -----------------------------------------------

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryEntity);
    const entity = await repository.findOneBy({ id: payload.id });
    if (!entity) {
        useLogger()
            .error({
                message: 'Registry not found.',
                component: 'registry',
                command: RegistryCommand.SETUP,
            });

        return payload;
    }

    // ---------------------------------------------------------------------

    const projectRepository = dataSource.getRepository(RegistryProjectEntity);

    // ---------------------------------------------------------------------

    // incoming
    let incomingEntity = await projectRepository.findOneBy({
        name: REGISTRY_INCOMING_PROJECT_NAME,
        registry_id: entity.id,
    });
    if (!incomingEntity) {
        incomingEntity = projectRepository.create({
            name: REGISTRY_INCOMING_PROJECT_NAME,
            external_name: generateRegistryProjectId(),
            type: RegistryProjectType.INCOMING,
            registry_id: entity.id,
            public: false,
        });
    } else {
        incomingEntity = projectRepository.merge(incomingEntity, {
            public: false,
        });
    }
    await projectRepository.save(incomingEntity);

    // ---------------------------------------------------------------------

    // outgoing
    let outgoingEntity = await projectRepository.findOneBy({
        name: REGISTRY_OUTGOING_PROJECT_NAME,
        registry_id: entity.id,
    });
    if (!outgoingEntity) {
        outgoingEntity = projectRepository.create({
            name: REGISTRY_OUTGOING_PROJECT_NAME,
            external_name: generateRegistryProjectId(),
            type: RegistryProjectType.OUTGOING,
            registry_id: entity.id,
            public: false,
        });
    } else {
        outgoingEntity = projectRepository.merge(outgoingEntity, {
            public: false,
        });
    }
    await projectRepository.save(outgoingEntity);

    // -----------------------------------------------------------------------

    // master ( images )
    let masterImagesEntity = await projectRepository.findOneBy({
        external_name: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
        registry_id: entity.id,
    });
    if (!masterImagesEntity) {
        masterImagesEntity = projectRepository.create({
            name: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
            external_name: REGISTRY_MASTER_IMAGE_PROJECT_NAME, // todo: can this be generated?
            type: RegistryProjectType.MASTER_IMAGES,
            registry_id: entity.id,
            public: true,
        });
    } else {
        masterImagesEntity = projectRepository.merge(masterImagesEntity, {
            public: false,
        });
    }

    await projectRepository.save(masterImagesEntity);

    // -----------------------------------------------

    const entities = await projectRepository.find({
        where: {
            registry_id: entity.id,
        },
        select: ['id'],
    });

    const queueRouter = useQueueRouter();
    for (let i = 0; i < entities.length; i++) {
        const queueMessage = buildRegistryTaskQueueRouterPayload({
            command: RegistryCommand.PROJECT_LINK,
            data: {
                id: entities[i].id,
            },
        });

        await queueRouter.publish(queueMessage);
    }

    return payload;
}
