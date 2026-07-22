/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import { validateEntityJoinColumns } from 'typeorm-extension';
import type { IQuery } from '@rapiq/core';
import { RegistryProjectEntity } from '../../../../../adapters/database/entities/registry-project.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type {
    IRegistryProjectRepository,
} from '../../../../../core/index.ts';
import { applyQuery } from '../query.ts';

export class RegistryProjectRepositoryAdapter implements IRegistryProjectRepository {
    protected dataSource: DataSource;

    protected repository: Repository<RegistryProjectEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(RegistryProjectEntity);
    }

    async findMany(query: IQuery): Promise<EntityRepositoryFindManyResult<RegistryProject>> {
        const qb = this.repository.createQueryBuilder('registryProject');
        qb.groupBy('registryProject.id');

        const { pagination } = applyQuery(qb, query);

        const [entities, total] = await qb.getManyAndCount();

        return {
            data: entities,
            meta: {
                total,
                ...pagination,
            },
        };
    }

    async findOneById(id: string): Promise<RegistryProject | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneWithSecret(id: string): Promise<RegistryProject | null> {
        const qb = this.repository.createQueryBuilder('registryProject')
            .addSelect(['registryProject.account_secret'])
            .where('registryProject.id = :id', { id });

        return qb.getOne();
    }

    async findOneBy(where: Record<string, any>): Promise<RegistryProject | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<RegistryProject[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<RegistryProject>): RegistryProject {
        return this.repository.create(data) as RegistryProject;
    }

    merge(entity: RegistryProject, data: Partial<RegistryProject>): RegistryProject {
        return this.repository.merge(entity as RegistryProjectEntity, data) as RegistryProject;
    }

    async save(entity: RegistryProject, ctx?: EntityPersistContext): Promise<RegistryProject> {
        return this.repository.save(entity as RegistryProjectEntity, ctx);
    }

    async remove(entity: RegistryProject, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as RegistryProjectEntity, ctx);
    }

    async validateJoinColumns(data: Partial<RegistryProject>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: RegistryProjectEntity,
        });
    }
}
