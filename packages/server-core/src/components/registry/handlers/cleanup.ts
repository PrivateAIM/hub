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
import { useLogger, useQueueRouter } from '@privateaim/server-kit';
import { RegistryEntity, RegistryProjectEntity } from '../../../database/domains';
import { ComponentName } from '../../constants';
import { RegistryCommand } from '../constants';
import type { RegistryCleanupPayload } from '../type';
import { buildRegistryTaskQueueRouterPayload } from '../utils';
import { createBasicHarborAPIClient } from './utils';

export async function cleanupRegistry(payload: RegistryCleanupPayload) {
    if (!payload.id) {
        useLogger()
            .warn('No registry specified.', {
                component: ComponentName.REGISTRY,
                command: RegistryCommand.CLEANUP,
            });

        return;
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryEntity);
    const entity = await repository.createQueryBuilder('registry')
        .addSelect([
            'registry.account_secret',
        ])
        .where('registry.id = :id', { id: payload.id })
        .getOne();

    if (!entity) {
        useLogger()
            .error({
                message: 'Registry not found.',
                component: ComponentName.REGISTRY,
                command: RegistryCommand.CLEANUP,
            });

        return;
    }

    const connectionString = buildRegistryClientConnectionStringFromRegistry(entity);
    const httpClient = createBasicHarborAPIClient(connectionString);

    const { data: projects } = await httpClient.project.getAll();

    const projectRepository = dataSource.getRepository(RegistryProjectEntity);
    const projectEntities = await projectRepository.find();
    const projectEntityExternalNames = projectEntities.map((item) => item.external_name);

    const queueRouter = useQueueRouter();

    for (let i = 0; i < projects.length; i++) {
        const index = projectEntityExternalNames.indexOf(`${projects[i].name}`);
        if (index !== -1) {
            continue;
        }

        if (projects[i].name === REGISTRY_MASTER_IMAGE_PROJECT_NAME) {
            continue;
        }

        const queueMessage = buildRegistryTaskQueueRouterPayload({
            command: RegistryCommand.PROJECT_UNLINK,
            data: {
                registryId: entity.id,
                externalName: projects[i].name,
            },
        });

        await queueRouter.publish(queueMessage);
    }
}
