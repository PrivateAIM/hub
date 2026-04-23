/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNode } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    applyQuery,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import { AnalysisNodeEntity } from '../../../../../adapters/database/entities/analysis-node.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type { IAnalysisNodeRepository } from '../../../../../core/entities/analysis-node/types.ts';

export class AnalysisNodeRepositoryAdapter implements IAnalysisNodeRepository {
    protected dataSource: DataSource;

    protected repository: Repository<AnalysisNodeEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(AnalysisNodeEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisNode>> {
        const qb = this.repository.createQueryBuilder('analysisNode');
        qb.groupBy('analysisNode.id');

        const { pagination } = applyQuery(qb, query, {
            defaultAlias: 'analysisNode',
            filters: {
                allowed: [
                    'execution_status',
                    'approval_status',
                    'analysis_id',
                    'analysis_realm_id',
                    'analysis.id',
                    'analysis.name',
                    'analysis.project_id',
                    'node_id',
                    'node_realm_id',
                    'node.name',
                    'node.realm_id',
                ],
            },
            pagination: { maxLimit: 50 },
            relations: {
                allowed: ['node', 'analysis'],
                onJoin: (_property, key, query) => {
                    query.addGroupBy(`${key}.id`);
                },
            },
            sort: {
                allowed: [
                    'created_at',
                    'updated_at',
                    'analysis.name',
                    'analysis.created_at',
                    'analysis.updated_at',
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

    async findOneById(id: string): Promise<AnalysisNode | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<AnalysisNode | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<AnalysisNode[]> {
        return this.repository.findBy(where);
    }

    async findManyWithNodeByAnalysis(analysisId: string): Promise<AnalysisNode[]> {
        return this.repository.find({
            where: { analysis_id: analysisId },
            relations: ['node'],
            cache: false,
        });
    }

    create(data: Partial<AnalysisNode>): AnalysisNode {
        return this.repository.create(data) as AnalysisNode;
    }

    merge(entity: AnalysisNode, data: Partial<AnalysisNode>): AnalysisNode {
        return this.repository.merge(entity as AnalysisNodeEntity, data) as AnalysisNode;
    }

    async save(entity: AnalysisNode, ctx?: EntityPersistContext): Promise<AnalysisNode> {
        return this.repository.save(entity as AnalysisNodeEntity, ctx);
    }

    async remove(entity: AnalysisNode, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as AnalysisNodeEntity, ctx);
    }

    async validateJoinColumns(data: Partial<AnalysisNode>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: AnalysisNodeEntity,
        });
    }
}
