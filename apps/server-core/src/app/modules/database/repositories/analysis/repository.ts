/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    applyFilters,
    applyPagination,
    applyQueryFieldsParseOutput,
    applyRelations,
    applySort,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import type { ParseAllowedOption } from 'rapiq';
import { parseQueryFields } from 'rapiq';
import { AnalysisEntity } from '../../../../../adapters/database/entities/analysis.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type {
    IAnalysisRepository,
} from '../../../../../core/index.ts';

const DEFAULT_FIELDS: ParseAllowedOption<AnalysisEntity> = [
    'id',
    'name',
    'description',
    'nodes',
    'nodes_approved',
    'configuration_locked',
    'configuration_entrypoint_valid',
    'configuration_image_valid',
    'configuration_node_aggregator_valid',
    'configuration_node_default_valid',
    'configuration_nodes_valid',
    'distribution_status',
    'distribution_progress',
    'build_nodes_valid',
    'build_status',
    'build_progress',
    'build_hash',
    'build_os',
    'build_size',
    'execution_status',
    'execution_progress',
    'created_at',
    'updated_at',
    'registry_id',
    'realm_id',
    'user_id',
    'project_id',
    'master_image_id',
];

export class AnalysisRepositoryAdapter implements IAnalysisRepository {
    protected dataSource: DataSource;

    protected repository: Repository<AnalysisEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(AnalysisEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Analysis>> {
        const {
            filter,
            page,
            fields,
            include,
            sort,
        } = query;

        const qb = this.repository.createQueryBuilder('analysis');
        qb.groupBy('analysis.id');

        const fieldsParsed = parseQueryFields<AnalysisEntity>(fields, {
            default: DEFAULT_FIELDS,
            defaultPath: 'analysis',
        });

        applyQueryFieldsParseOutput(qb, fieldsParsed, { defaultAlias: 'analysis' });

        applyRelations(qb, include, {
            defaultAlias: 'analysis',
            allowed: ['project', 'master_image'],
            onJoin: (_property, key, query) => {
                query.addGroupBy(`${key}.id`);
            },
        });

        applySort(qb, sort, {
            defaultAlias: 'analysis',
            allowed: ['created_at', 'updated_at'],
            default: { updated_at: 'DESC' },
        });

        applyFilters(qb, filter, {
            allowed: [
                'id',
                'name',
                'description',
                'project_id',
                'realm_id',
                'build_status',
                'execution_status',
                'configuration_locked',
            ],
            defaultAlias: 'analysis',
        });

        const pagination = applyPagination(qb, page, { maxLimit: 50 });

        const [entities, total] = await qb.getManyAndCount();

        return {
            data: entities,
            meta: {
                total,
                ...pagination,
            },
        };
    }

    async findOneById(id: string): Promise<Analysis | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneWithProject(id: string): Promise<Analysis | null> {
        return this.repository.findOne({ where: { id }, relations: ['project'] });
    }

    async findOneBy(where: Record<string, any>): Promise<Analysis | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<Analysis[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<Analysis>): Analysis {
        return this.repository.create(data) as Analysis;
    }

    merge(entity: Analysis, data: Partial<Analysis>): Analysis {
        return this.repository.merge(entity as AnalysisEntity, data) as Analysis;
    }

    async save(entity: Analysis, ctx?: EntityPersistContext): Promise<Analysis> {
        return this.repository.save(entity as AnalysisEntity, ctx);
    }

    async remove(entity: Analysis, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as AnalysisEntity, ctx);
    }

    async validateJoinColumns(data: Partial<Analysis>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: AnalysisEntity,
        });
    }
}
