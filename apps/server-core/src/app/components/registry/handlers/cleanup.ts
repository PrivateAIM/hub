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
import type { DataSource } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { withDataSourceLock } from '@privateaim/server-db-kit';
import type { ComponentHandler, ComponentHandlerContext } from 'hubwire';
import { RegistryEntity, RegistryProjectEntity } from '../../../../adapters/database/index.ts';
import { RegistryCommand } from '../../../../core/domains/index.ts';
import type { RegistryEventMap } from '../types.ts';
import type { Registry } from '@privateaim/core-kit';
import { createBasicHarborAPIClient } from './utils.ts';
import { collectRegistryMigrationRetainedProjectIds } from './helpers/migration-retention.ts';

export class RegistryCleanupHandler implements ComponentHandler<
    RegistryEventMap,
    RegistryCommand.CLEANUP
> {
    constructor(
        private readonly getDataSource: () => Promise<DataSource> = useDataSource,
        private readonly createClient: typeof createBasicHarborAPIClient = createBasicHarborAPIClient,
    ) {}

    async handle(
        value: Pick<Registry, 'id'>,
        context: ComponentHandlerContext<RegistryEventMap, RegistryCommand.CLEANUP>,
    ): Promise<void> {
        const dataSource = await this.getDataSource();
        const repository = dataSource.getRepository(RegistryEntity);
        const entity = await repository.createQueryBuilder('registry')
            .addSelect([
                'registry.accountSecret',
            ])
            .where('registry.id = :id', { id: value.id })
            .getOne();

        if (!entity) {
            return;
        }

        const connectionString = buildRegistryClientConnectionStringFromRegistry(entity);
        const httpClient = this.createClient(connectionString);

        // Migration holds this lock from destination creation through cutover,
        // including the interval before its durable retention marker exists.
        await withDataSourceLock(dataSource, `server-core:registry-migration:${entity.id}`, async () => {
            const retainedIds = await collectRegistryMigrationRetainedProjectIds(httpClient);
            const { data: projects } = await httpClient.project.getAll();
            const projectRepository = dataSource.getRepository(RegistryProjectEntity);
            const projectEntities = await projectRepository.findBy({ registryId: entity.id });
            const activeNames = new Set(projectEntities.map((item) => item.externalName));

            activeNames.add(REGISTRY_MASTER_IMAGE_PROJECT_NAME);

            for (const project of projects) {
                if (!activeNames.has(project.name) && !retainedIds.has(String(project.project_id))) {
                    await context.handle(RegistryCommand.PROJECT_UNLINK, {
                        registryId: entity.id,
                        externalName: project.name,
                    });
                }
            }
        });
    }
}
