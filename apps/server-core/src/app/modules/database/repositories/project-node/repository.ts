/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectNode } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    applyQuery,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import { ProjectNodeEntity } from '../../../../../adapters/database/entities/project-node.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type { IProjectNodeRepository } from '../../../../../core/entities/project-node/types.ts';

export class ProjectNodeRepositoryAdapter implements IProjectNodeRepository {
    protected dataSource: DataSource;

    protected repository: Repository<ProjectNodeEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(ProjectNodeEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<ProjectNode>> {
        const qb = this.repository.createQueryBuilder('projectNode');
        qb.groupBy('projectNode.id');

        const { pagination } = applyQuery(qb, query, {
            defaultAlias: 'projectNode',
            filters: {
                allowed: [
                    'project_realm_id',
                    'project_id',
                    'project.id',
                    'project.name',
                    'node_realm_id',
                    'node_id',
                    'node.name',
                ],
            },
            pagination: { maxLimit: 50 },
            relations: {
                allowed: ['node', 'project'],
                onJoin: (_property, key, query) => {
                    query.addGroupBy(`${key}.id`);
                },
            },
            sort: {
                allowed: [
                    'created_at',
                    'updated_at',
                    'project.name',
                    'project.created_at',
                    'project.updated_at',
                    'node.name',
                    'node.created_at',
                    'node.updated_at',
                ],
            },
        });

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
