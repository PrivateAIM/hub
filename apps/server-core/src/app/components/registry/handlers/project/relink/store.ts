/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildRegistryClientConnectionStringFromRegistry } from '@privateaim/core-kit';
import { EntityConflictError } from '@privateaim/errors';
import { ProcessStatus } from '@privateaim/kit';
import { withDataSourceLock } from '@privateaim/server-db-kit';
import type { DataSource, EntityManager } from 'typeorm';
import { In, Not } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import { AnalysisEntity } from '../../../../../../adapters/database/entities/analysis.ts';
import { RegistryEntity } from '../../../../../../adapters/database/entities/registry.ts';
import { RegistryProjectEntity } from '../../../../../../adapters/database/entities/registry-project.ts';
import type {
    IRegistryProjectRelinkStore,
    RegistryProjectRelinkSource,
    RegistryProjectRelinkTarget,
} from './types.ts';

export class RegistryProjectRelinkStore implements IRegistryProjectRelinkStore {
    constructor(private readonly getDataSource: () => Promise<DataSource> = useDataSource) {}

    async withLock<T>(registryId: string, fn: () => Promise<T>): Promise<T> {
        const dataSource = await this.getDataSource();

        // Cleanup takes the same lock, including the project-create/marker gap.
        return withDataSourceLock(dataSource, `server-core:registry-migration:${registryId}`, fn);
    }

    async load(id: string): Promise<RegistryProjectRelinkSource | null> {
        const dataSource = await this.getDataSource();
        const project = await dataSource.getRepository(RegistryProjectEntity)
            .createQueryBuilder('project')
            .addSelect('project.accountSecret')
            .where('project.id = :id', { id })
            .getOne();

        if (!project) {
            return null;
        }

        const registry = await this.loadRegistry(dataSource.manager, project.registryId);

        if (!registry) {
            return null;
        }

        return { project, registry };
    }

    async assertIdle(source: RegistryProjectRelinkSource): Promise<void> {
        const dataSource = await this.getDataSource();

        await this.assertManagerIdle(dataSource.manager, source.registry.id);
    }

    async assertTargetAvailable(source: RegistryProjectRelinkSource, targetName: string): Promise<void> {
        const dataSource = await this.getDataSource();
        const reserved = await dataSource.getRepository(RegistryProjectEntity).existsBy({
            registryId: source.registry.id,
            externalName: targetName,
            id: Not(source.project.id),
        });

        if (reserved) {
            throw new EntityConflictError('The migration destination is reserved by another local registry project.');
        }
    }

    async cutover(source: RegistryProjectRelinkSource, target: RegistryProjectRelinkTarget): Promise<void> {
        const dataSource = await this.getDataSource();

        await dataSource.transaction(async (manager) => {
            const qb = manager.getRepository(RegistryProjectEntity)
                .createQueryBuilder('project')
                .addSelect('project.accountSecret')
                .where('project.id = :id', { id: source.project.id });

            if (dataSource.options.type !== 'better-sqlite3') {
                qb.setLock('pessimistic_write');
            }

            const project = await qb.getOne();
            const registry = await this.loadRegistry(manager, source.registry.id);
            const bindingKeys = [
                'registryId', 
                'externalName', 
                'externalId', 
                'accountId', 
                'accountName', 
                'accountSecret', 
                'public',
            ] as const;

            const bindingChanged = !project || bindingKeys.some((key) => project[key] !== source.project[key]);

            if (bindingChanged || !registry ||
                buildRegistryClientConnectionStringFromRegistry(registry) !==
                buildRegistryClientConnectionStringFromRegistry(source.registry)) {
                throw new EntityConflictError('The registry project changed during migration; source retained.');
            }

            await this.assertManagerIdle(manager, source.registry.id);
            Object.assign(project, target);
            await manager.getRepository(RegistryProjectEntity).save(project);
        });
    }

    private loadRegistry(manager: EntityManager, id: string): Promise<RegistryEntity | null> {
        return manager.getRepository(RegistryEntity)
            .createQueryBuilder('registry')
            .addSelect('registry.accountSecret')
            .where('registry.id = :id', { id })
            .getOne();
    }

    private async assertManagerIdle(manager: EntityManager, registryId: string): Promise<void> {
        // A queued distribution may push into this project. Quiescence is still
        // required: workers/external clients do not take this advisory lock.
        const running = await manager.getRepository(AnalysisEntity).countBy({
            registryId,
            distributionStatus: In([ProcessStatus.STARTING, ProcessStatus.STARTED]),
        });

        if (running > 0) {
            throw new EntityConflictError('Registry projects cannot migrate during an active analysis distribution.');
        }
    }
}
