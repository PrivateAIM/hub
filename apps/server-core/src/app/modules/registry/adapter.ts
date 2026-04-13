/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import { RegistryEntity, RegistryProjectEntity } from '../../../adapters/database/entities/index.ts';
import { RegistryCommand, useRegistryComponentCaller } from '../../../components/index.ts';
import type { IRegistryManager } from '../../../core/index.ts';

export class RegistryManagerAdapter implements IRegistryManager {
    protected registryRepository: Repository<RegistryEntity>;

    protected registryProjectRepository: Repository<RegistryProjectEntity>;

    constructor(dataSource: DataSource) {
        this.registryRepository = dataSource.getRepository(RegistryEntity);
        this.registryProjectRepository = dataSource.getRepository(RegistryProjectEntity);
    }

    async findDefaultRegistryId(): Promise<string | null> {
        const registries = await this.registryRepository.find({ take: 1 });
        const [registry] = registries;
        return registry?.id ?? null;
    }

    async createProject(data: Partial<RegistryProject>): Promise<RegistryProject> {
        const entity = this.registryProjectRepository.create(data);
        return this.registryProjectRepository.save(entity);
    }

    async findProject(id: string): Promise<RegistryProject | null> {
        return this.registryProjectRepository.findOneBy({ id });
    }

    async saveProject(project: RegistryProject): Promise<RegistryProject> {
        return this.registryProjectRepository.save(project as RegistryProjectEntity);
    }

    async removeProject(project: RegistryProject): Promise<void> {
        await this.registryProjectRepository.remove(project as RegistryProjectEntity);
    }

    async linkProject(id: string): Promise<void> {
        const caller = useRegistryComponentCaller();
        await caller.call(RegistryCommand.PROJECT_LINK, { id }, {});
    }

    async relinkProject(project: RegistryProject): Promise<void> {
        const caller = useRegistryComponentCaller();
        await caller.call(
            RegistryCommand.PROJECT_RELINK,
            {
                id: project.id,
                registryId: project.registry_id,
                externalName: project.external_name,
                accountId: project.account_id,
            },
            {},
        );
    }

    async unlinkProject(project: RegistryProject): Promise<void> {
        const caller = useRegistryComponentCaller();
        await caller.call(
            RegistryCommand.PROJECT_UNLINK,
            {
                id: project.id,
                registryId: project.registry_id,
                externalName: project.external_name,
                accountId: project.account_id,
            },
            {},
        );
    }
}
