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
import {
    type ComponentHandler, type ComponentHandlerContext,
} from '@privateaim/server-kit';
import { RegistryEntity, RegistryProjectEntity } from '../../../database';
import { RegistryCommand } from '../constants';
import type { RegistryEventMap, RegistrySetupPayload } from '../type';

export class RegistrySetupHandler implements ComponentHandler<
RegistryEventMap,
RegistryCommand.SETUP
> {
    async handle(
        value: RegistrySetupPayload,
        context: ComponentHandlerContext<RegistryEventMap, RegistryCommand.SETUP>,
    ): Promise<void> {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(RegistryEntity);
        const entity = await repository.findOneBy({ id: value.id });
        if (!entity) {
            return;
        }

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

        for (let i = 0; i < entities.length; i++) {
            await context.handle(RegistryCommand.PROJECT_LINK, {
                id: entities[i].id,
            });
        }
    }
}
