/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { buildRegistryClientConnectionStringFromRegistry } from '@privateaim/core-kit';
import { useDataSource } from 'typeorm-extension';
import type { ComponentHandler, Logger } from '@privateaim/server-kit';
import type { Client as AuthupClient } from '@authup/core-http-kit';
import { RegistryEntity, RegistryProjectEntity } from '../../../../../adapters/database/index.ts';
import { RegistryCommand } from '../../constants.ts';
import type { RegistryEventMap, RegistryProjectLinkPayload } from '../../type.ts';
import { ensureRemoteRegistryProject } from '../helpers/remote.ts';
import { ensureRemoteRegistryProjectAccount } from '../helpers/remote-robot-account.ts';
import { saveRemoteRegistryProjectWebhook } from '../helpers/remote-webhook.ts';
import { createBasicHarborAPIClient } from '../utils.ts';

export class RegistryProjectLinkHandler implements ComponentHandler<
    RegistryEventMap,
    RegistryCommand.PROJECT_LINK
> {
    protected publicURL: string;

    protected logger?: Logger;

    protected authupClient?: AuthupClient;

    constructor(ctx: {
        publicURL: string;
        logger?: Logger;
        authupClient?: AuthupClient;
    }) {
        this.publicURL = ctx.publicURL;
        this.logger = ctx.logger;
        this.authupClient = ctx.authupClient;
    }

    async handle(
        value: RegistryProjectLinkPayload,
    ): Promise<void> {
        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(RegistryProjectEntity);
        const entity = await repository.createQueryBuilder('registryProject')
            .addSelect([
                'registryProject.accountSecret',
            ])
            .where('registryProject.id = :id', { id: value.id })
            .getOne();

        if (!entity) {
            this.logger?.error('Registry project not found.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_LINK,
            });

            return;
        }

        const registryRepository = dataSource.getRepository(RegistryEntity);
        const registryEntity = await registryRepository.createQueryBuilder('registry')
            .addSelect([
                'registry.accountSecret',
            ])
            .where('registry.id = :id', { id: entity.registryId })
            .getOne();

        if (!registryEntity) {
            this.logger?.error('Registry not found.', {
                component: 'registry',
                command: RegistryCommand.PROJECT_LINK,
            });

            return;
        }

        const connectionString = buildRegistryClientConnectionStringFromRegistry(registryEntity);
        const httpClient = createBasicHarborAPIClient(connectionString);

        try {
            const project = await ensureRemoteRegistryProject(httpClient, {
                remoteId: entity.externalId,
                remoteName: entity.externalName,
                remoteOptions: { public: entity.public },
            });

            // `project_id` is Harbor's own field name — third-party wire shape.
            entity.externalId = `${project.project_id}`;
        } catch (e) {
            // `Project ${entity.externalName} could not be created.`
            this.logger?.error({
                message: e,
                component: 'registry',
                command: RegistryCommand.PROJECT_LINK,
            });

            return;
        }

        await repository.save(entity);

        try {
            const robotAccount = await ensureRemoteRegistryProjectAccount(httpClient, {
                name: entity.externalName,
                account: {
                    id: Number.parseInt(entity.accountId, 10),
                    name: entity.accountName,
                    secret: value.secret || entity.accountSecret,
                },
            });

            if (robotAccount) {
                entity.accountId = `${robotAccount.id}`;
                entity.accountName = robotAccount.name;
                entity.accountSecret = robotAccount.secret;
            } else {
                entity.accountId = null;
                entity.accountName = null;
                entity.accountSecret = null;
            }
        } catch (e) {
            // 'Robot account could not be created.'
            this.logger?.error({
                message: e,
                component: 'registry',
                command: RegistryCommand.PROJECT_LINK,
            });

            return;
        }

        await repository.save(entity);

        try {
            if (!this.authupClient) {
                throw new Error('Authup client is not available');
            }

            const webhook = await saveRemoteRegistryProjectWebhook(
                httpClient,
                {
                    publicURL: this.publicURL,
                    projectIdOrName: entity.externalName,
                    isProjectName: true,
                    authupClient: this.authupClient,
                },
            );

            // webhook.id is also present :)
            entity.webhookName = `${webhook.id}`;
            entity.webhookExists = true;
        } catch (e) {
            // 'Webhook could not be created.'
            this.logger?.error({
                message: e,
                component: 'registry',
                command: RegistryCommand.PROJECT_LINK,
            });

            return;
        }

        await repository.save(entity);
    }
}
