/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import { RegistryEntity, RegistryProjectEntity } from '../../../adapters/database/entities/index.ts';
import { RegistryCommand } from '../../components/index.ts';
import type { RegistryComponentCaller } from '../../components/registry/caller/module.ts';
import type { IRegistryManager } from '../../../core/index.ts';

export class RegistryManagerAdapter implements IRegistryManager {
    protected registryRepository: Repository<RegistryEntity>;

    protected registryProjectRepository: Repository<RegistryProjectEntity>;

    protected registryComponentCaller?: RegistryComponentCaller;

    constructor(ctx: { dataSource: DataSource; registryComponentCaller?: RegistryComponentCaller }) {
        this.registryRepository = ctx.dataSource.getRepository(RegistryEntity);
        this.registryProjectRepository = ctx.dataSource.getRepository(RegistryProjectEntity);
        this.registryComponentCaller = ctx.registryComponentCaller;
    }

    async findDefaultRegistryId(): Promise<string | null> {
        // Only auto-assign a registry when the choice is unambiguous. There is no
        // designated "default" registry, so with more than one configured, picking
        // an arbitrary "first" row would provision the node against the wrong
        // registry — later surfacing the wrong host in its credentials. When the
        // choice is ambiguous, require an explicit registry selection instead.
        const [registries, total] = await this.registryRepository.findAndCount({ take: 2 });
        if (total !== 1) {
            return null;
        }

        return registries[0].id;
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
        if (!this.registryComponentCaller) {
            return;
        }

        await this.registryComponentCaller.call(RegistryCommand.PROJECT_LINK, { id }, {});
    }

    async relinkProject(project: RegistryProject): Promise<void> {
        if (!this.registryComponentCaller) {
            return;
        }

        await this.registryComponentCaller.call(
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
        if (!this.registryComponentCaller) {
            return;
        }

        await this.registryComponentCaller.call(
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
