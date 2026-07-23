/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Project } from '@privateaim/core-kit';
import type { IQuery } from '@rapiq/core';
import type { DataSource, Repository } from 'typeorm';
import {
    isEntityUnique,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import { ProjectEntity } from '../../../../../adapters/database/entities/project.ts';
import { DatabaseConflictError } from '../../../../../adapters/database/error/index.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type {
    IProjectRepository,
} from '../../../../../core/index.ts';
import { applyQuery } from '../query.ts';

export class ProjectRepositoryAdapter implements IProjectRepository {
    protected dataSource: DataSource;

    protected repository: Repository<ProjectEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(ProjectEntity);
    }

    async findMany(query: IQuery): Promise<EntityRepositoryFindManyResult<Project>> {
        const qb = this.repository.createQueryBuilder('project');
        qb.groupBy('project.id');

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

    async findOneById(id: string): Promise<Project | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<Project | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<Project[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<Project>): Project {
        return this.repository.create(data) as Project;
    }

    merge(entity: Project, data: Partial<Project>): Project {
        return this.repository.merge(entity as ProjectEntity, data) as Project;
    }

    async save(entity: Project, ctx?: EntityPersistContext): Promise<Project> {
        return this.repository.save(entity as ProjectEntity, ctx);
    }

    async remove(entity: Project, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as ProjectEntity, ctx);
    }

    async validateJoinColumns(data: Partial<Project>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: ProjectEntity,
        });
    }

    async checkUniqueness(data: Partial<Project>, existing?: Project): Promise<void> {
        const isUnique = await isEntityUnique({
            entity: data,
            entityTarget: ProjectEntity,
            entityExisting: existing,
            dataSource: this.dataSource,
        });
        if (!isUnique) {
            throw new DatabaseConflictError();
        }
    }
}
