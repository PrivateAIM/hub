/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildRegistryClientConnectionStringFromRegistry } from '@privateaim/core-kit';
import { useDataSource } from 'typeorm-extension';
import type { ComponentHandler, Logger } from '@privateaim/server-kit';
import { RegistryEntity, RegistryProjectEntity } from '../../../../../adapters/database/index.ts';
import { RegistryCommand } from '../../constants.ts';
import type { RegistryEventMap, RegistryProjectUnlinkPayload } from '../../type.ts';
import { createBasicHarborAPIClient } from '../utils.ts';

export class RegistryProjectUnlinkHandler implements ComponentHandler<
    RegistryEventMap,
    RegistryCommand.PROJECT_UNLINK
> {
    protected logger?: Logger;

    constructor(ctx: { logger?: Logger } = {}) {
        this.logger = ctx.logger;
    }

    async handle(value: RegistryProjectUnlinkPayload): Promise<void> {
        const dataSource = await useDataSource();
        const registryRepository = dataSource.getRepository(RegistryEntity);
        const registryEntity = await registryRepository.createQueryBuilder('registry')
            .addSelect([
                'registry.account_secret',
            ])
            .where('registry.id = :id', { id: value.registryId })
            .getOne();

        const connectionString = buildRegistryClientConnectionStringFromRegistry(registryEntity);
        const httpClient = createBasicHarborAPIClient(connectionString);

        try {
            const { data: repositories } = await httpClient.projectRepository.getAll({ projectName: value.externalName });

            const promises: Promise<any>[] = [];

            for (const repository of repositories) {
                this.logger?.debug(`Deleting registry project repository ${repository.name}`);
                promises.push(httpClient.projectRepository.delete(repository.name));
            }

            await Promise.all(promises);
        } catch (e) {
            // 'Project repositories could not be deleted.'
            this.logger?.error({
                message: e,
                component: 'registry',
                command: RegistryCommand.PROJECT_UNLINK,
            });

            return;
        }

        try {
            await httpClient.project
                .delete(value.externalName, true);
        } catch (e) {
            // 'Project could not be deleted.'
            this.logger?.warn({
                message: e,
                component: 'registry',
                command: RegistryCommand.PROJECT_UNLINK,
            });

            return;
        }

        if (value.accountId) {
            try {
                await httpClient.robot
                    .delete(Number.parseInt(value.accountId, 10));
            } catch (e) {
                // 'Robot Account could not be deleted.'
                this.logger?.warn({
                    message: e,
                    component: 'registry',
                    command: RegistryCommand.PROJECT_UNLINK,
                });
            }
        }

        if (value.id) {
            const projectRepository = dataSource.getRepository(RegistryProjectEntity);
            const project = await projectRepository.findOneBy({ id: value.id });

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
}
