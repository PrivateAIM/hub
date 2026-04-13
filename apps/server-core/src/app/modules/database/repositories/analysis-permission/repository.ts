/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisPermission } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    applyQuery,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import { AnalysisPermissionEntity } from '../../../../../adapters/database/entities/analysis-permission.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '../../../../../core/entities/types.ts';
import type { IAnalysisPermissionRepository } from '../../../../../core/entities/analysis-permission/types.ts';

export class AnalysisPermissionRepositoryAdapter implements IAnalysisPermissionRepository {
    protected dataSource: DataSource;

    protected repository: Repository<AnalysisPermissionEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(AnalysisPermissionEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisPermission>> {
        const qb = this.repository.createQueryBuilder('analysisPermission');
        qb.groupBy('analysisPermission.id');

        const { pagination } = applyQuery(qb, query, {
            defaultAlias: 'analysisPermission',
            filters: {
                allowed: [
                    'permission_id',
                    'permission_realm_id',
                    'analysis_id',
                    'analysis_realm_id',
                    'analysis.id',
                    'analysis.name',
                ],
            },
            pagination: { maxLimit: 50 },
            relations: {
                allowed: ['analysis'],
                onJoin: (_property, key, query) => {
                    query.addGroupBy(`${key}.id`);
                },
            },
            sort: { allowed: ['created_at', 'updated_at'] },
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

    async findOneById(id: string): Promise<AnalysisPermission | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<AnalysisPermission | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<AnalysisPermission[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<AnalysisPermission>): AnalysisPermission {
        return this.repository.create(data) as AnalysisPermission;
    }

    merge(entity: AnalysisPermission, data: Partial<AnalysisPermission>): AnalysisPermission {
        return this.repository.merge(entity as AnalysisPermissionEntity, data) as AnalysisPermission;
    }

    async save(entity: AnalysisPermission, ctx?: EntityPersistContext): Promise<AnalysisPermission> {
        return this.repository.save(entity as AnalysisPermissionEntity, ctx);
    }

    async remove(entity: AnalysisPermission, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as AnalysisPermissionEntity, ctx);
    }

    async validateJoinColumns(data: Partial<AnalysisPermission>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: AnalysisPermissionEntity,
        });
    }
}
