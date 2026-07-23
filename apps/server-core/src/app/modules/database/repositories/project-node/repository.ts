/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IQuery } from '@rapiq/core';
import type { ProjectNode } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import { validateEntityJoinColumns } from 'typeorm-extension';
import { ProjectNodeEntity } from '../../../../../adapters/database/entities/project-node.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type { IProjectNodeRepository } from '../../../../../core/entities/project-node/types.ts';
import { applyQuery } from '../query.ts';

export class ProjectNodeRepositoryAdapter implements IProjectNodeRepository {
    protected dataSource: DataSource;

    protected repository: Repository<ProjectNodeEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(ProjectNodeEntity);
    }

    async findMany(query: IQuery): Promise<EntityRepositoryFindManyResult<ProjectNode>> {
        const qb = this.repository.createQueryBuilder('projectNode');
        qb.groupBy('projectNode.id');

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

    async findOneById(id: string): Promise<ProjectNode | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<ProjectNode | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<ProjectNode[]> {
        return this.repository.findBy(where);
    }

    async findManyWithNodeByProject(projectId: string): Promise<ProjectNode[]> {
        return this.repository.find({
            where: { project_id: projectId },
            relations: { node: true },
            cache: false,
        });
    }

    create(data: Partial<ProjectNode>): ProjectNode {
        return this.repository.create(data) as ProjectNode;
    }

    merge(entity: ProjectNode, data: Partial<ProjectNode>): ProjectNode {
        return this.repository.merge(entity as ProjectNodeEntity, data) as ProjectNode;
    }

    async save(entity: ProjectNode, ctx?: EntityPersistContext): Promise<ProjectNode> {
        return this.repository.save(entity as ProjectNodeEntity, ctx);
    }

    async remove(entity: ProjectNode, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as ProjectNodeEntity, ctx);
    }

    async validateJoinColumns(data: Partial<ProjectNode>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: ProjectNodeEntity,
        });
    }
}
