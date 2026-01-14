/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    buildRegistryClientConnectionStringFromRegistry,
} from '@privateaim/core-kit';
import { useDataSource } from 'typeorm-extension';
import type {
    ComponentHandler,
    ComponentHandlerContext,
} from '@privateaim/server-kit';
import { RegistryEntity, RegistryProjectEntity } from '../../../database/index.ts';
import { RegistryCommand } from '../constants.ts';
import type { RegistryCleanupPayload, RegistryEventMap } from '../type.ts';
import { createBasicHarborAPIClient } from './utils.ts';

export class RegistryCleanupHandler implements ComponentHandler<
RegistryEventMap,
RegistryCommand.CLEANUP
> {
    async handle(
        value: RegistryCleanupPayload,
        context: ComponentHandlerContext<RegistryEventMap, RegistryCommand.CLEANUP>,
    ): Promise<void> {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(RegistryEntity);
        const entity = await repository.createQueryBuilder('registry')
            .addSelect([
                'registry.account_secret',
            ])
            .where('registry.id = :id', { id: value.id })
            .getOne();

        if (!entity) {
            return;
        }

        const connectionString = buildRegistryClientConnectionStringFromRegistry(entity);
        const httpClient = createBasicHarborAPIClient(connectionString);

        const { data: projects } = await httpClient.project.getAll();

        const projectRepository = dataSource.getRepository(RegistryProjectEntity);
        const projectEntities = await projectRepository.find();
        const projectEntityExternalNames = projectEntities.map((item) => item.external_name);

        for (let i = 0; i < projects.length; i++) {
            const index = projectEntityExternalNames.indexOf(`${projects[i].name}`);
            if (index !== -1) {
                continue;
            }

            if (projects[i].name === REGISTRY_MASTER_IMAGE_PROJECT_NAME) {
                continue;
            }

            await context.handle(RegistryCommand.PROJECT_UNLINK, {
                registryId: entity.id,
                externalName: projects[i].name,
            });
        }
    }
}
