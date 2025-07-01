/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { buildRegistryClientConnectionStringFromRegistry } from '@privateaim/core-kit';
import { useDataSource } from 'typeorm-extension';
import { useLogger } from '@privateaim/server-kit';
import { RegistryEntity, RegistryProjectEntity, removeRegistryProjectFromVault } from '../../../../database/domains';
import { RegistryCommand } from '../../constants';
import type { RegistryProjectUnlinkPayload } from '../../type';
import { createBasicHarborAPIClient } from '../utils';

export async function unlinkRegistryProject(
    payload: RegistryProjectUnlinkPayload,
) {
    const dataSource = await useDataSource();
    const registryRepository = dataSource.getRepository(RegistryEntity);
    const registryEntity = await registryRepository.createQueryBuilder('registry')
        .addSelect([
            'registry.account_secret',
        ])
        .where('registry.id = :id', { id: payload.registryId })
        .getOne();

    const connectionString = buildRegistryClientConnectionStringFromRegistry(registryEntity);
    const httpClient = createBasicHarborAPIClient(connectionString);

    try {
        const { data: repositories } = await httpClient.projectRepository.getAll({
            projectName: payload.externalName,
        });

        const promises: Promise<any>[] = [];

        for (let i = 0; i < repositories.length; i++) {
            useLogger().debug(`Deleting registry project repository ${repositories[i].name}`);
            promises.push(httpClient.projectRepository.delete(repositories[i].name));
        }

        await Promise.all(promises);
    } catch (e) {
        useLogger()
            .warn('Project repositories could not be deleted.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_UNLINK,
            });

        useLogger()
            .error(e);

        throw e;
    }

    try {
        await httpClient.project
            .delete(payload.externalName, true);
    } catch (e) {
        useLogger()
            .warn('Project could not be deleted.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_UNLINK,
            });

        useLogger()
            .error(e);

        throw e;
    }

    if (payload.accountId) {
        try {
            await httpClient.robot
                .delete(parseInt(payload.accountId, 10));
        } catch (e) {
            useLogger()
                .warn('Robot Account could not be deleted.', {
                    component: 'registry',
                    command: RegistryCommand.PROJECT_UNLINK,
                }, e);
        }
    }

    try {
        await removeRegistryProjectFromVault(payload.externalName);
    } catch (e) {
        useLogger()
            .warn('Vault project representation could not be deleted.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_UNLINK,
            }, e);

        throw e;
    }

    if (payload.id) {
        const projectRepository = dataSource.getRepository(RegistryProjectEntity);
        const project = await projectRepository.findOneBy({ id: payload.id });

        if (project) {
            project.external_id = null;

            project.account_id = null;
            project.account_name = null;
            project.account_secret = null;

            project.webhook_exists = false;
            project.webhook_name = null;

            await projectRepository.save(project);
        }
    }
}
