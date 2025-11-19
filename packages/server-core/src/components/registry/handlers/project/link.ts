/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { buildRegistryClientConnectionStringFromRegistry } from '@privateaim/core-kit';
import { useDataSource } from 'typeorm-extension';
import { type ComponentHandler, useLogger } from '@privateaim/server-kit';
import { RegistryEntity, RegistryProjectEntity } from '../../../../database';
import { RegistryCommand } from '../../constants';
import type { RegistryEventMap, RegistryProjectLinkPayload } from '../../type';
import { ensureRemoteRegistryProject } from '../helpers/remote';
import { ensureRemoteRegistryProjectAccount } from '../helpers/remote-robot-account';
import { saveRemoteRegistryProjectWebhook } from '../helpers/remote-webhook';
import { createBasicHarborAPIClient } from '../utils';

export class RegistryProjectLinkHandler implements ComponentHandler<
RegistryEventMap,
RegistryCommand.PROJECT_LINK
> {
    async handle(
        value: RegistryProjectLinkPayload,
    ): Promise<void> {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(RegistryProjectEntity);
        const entity = await repository.createQueryBuilder('registryProject')
            .addSelect([
                'registryProject.account_secret',
            ])
            .where('registryProject.id = :id', { id: value.id })
            .getOne();

        if (!entity) {
            useLogger()
                .error('Registry project not found.', {
                    component: 'registry',
                    command: RegistryCommand.PROJECT_LINK,
                });

            return;
        }

        const registryRepository = dataSource.getRepository(RegistryEntity);
        const registryEntity = await registryRepository.createQueryBuilder('registry')
            .addSelect([
                'registry.account_secret',
            ])
            .where('registry.id = :id', { id: entity.registry_id })
            .getOne();

        if (!registryEntity) {
            useLogger()
                .error('Registry not found.', {
                    component: 'registry',
                    command: RegistryCommand.PROJECT_LINK,
                });

            return;
        }

        const connectionString = buildRegistryClientConnectionStringFromRegistry(registryEntity);
        const httpClient = createBasicHarborAPIClient(connectionString);

        try {
            const project = await ensureRemoteRegistryProject(httpClient, {
                remoteId: entity.external_id,
                remoteName: entity.external_name,
                remoteOptions: {
                    public: entity.public,
                },
            });

            entity.external_id = `${project.project_id}`;
        } catch (e) {
            // `Project ${entity.external_name} could not be created.`
            useLogger()
                .error({
                    message: e,
                    component: 'registry',
                    command: RegistryCommand.PROJECT_LINK,
                });

            throw e;
        }

        await repository.save(entity);

        try {
            const robotAccount = await ensureRemoteRegistryProjectAccount(httpClient, {
                name: entity.external_name,
                account: {
                    id: parseInt(entity.account_id, 10),
                    name: entity.account_name,
                    secret: value.secret || entity.account_secret,
                },
            });

            if (robotAccount) {
                entity.account_id = `${robotAccount.id}`;
                entity.account_name = robotAccount.name;
                entity.account_secret = robotAccount.secret;
            } else {
                entity.account_id = null;
                entity.account_name = null;
                entity.account_secret = null;
            }
        } catch (e) {
            // 'Robot account could not be created.'
            useLogger()
                .error({
                    message: e,
                    component: 'registry',
                    command: RegistryCommand.PROJECT_LINK,
                });

            throw e;
        }

        await repository.save(entity);

        try {
            const webhook = await saveRemoteRegistryProjectWebhook(
                httpClient,
                {
                    projectIdOrName: entity.external_name,
                    isProjectName: true,
                },
            );

            // webhook.id is also present :)
            entity.webhook_name = `${webhook.id}`;
            entity.webhook_exists = true;
        } catch (e) {
            // 'Webhook could not be created.'
            useLogger()
                .error({
                    message: e,
                    component: 'registry',
                    command: RegistryCommand.PROJECT_LINK,
                });

            throw e;
        }

        await repository.save(entity);
    }
}
