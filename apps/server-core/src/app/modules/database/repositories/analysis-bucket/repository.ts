/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    applyFilters,
    applyPagination,
    applyQueryFieldsParseOutput,
    applyRelations,
    applySort,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import { parseQueryFields } from 'rapiq';
import { AnalysisBucketEntity } from '../../../../../adapters/database/entities/analysis-bucket.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
    IAnalysisBucketRepository,
} from '../../../../../core/index.ts';

const DEFAULT_FIELDS: (keyof AnalysisBucketEntity)[] = [
    'id',
    'type',
    'bucket_id',
    'analysis_id',
    'realm_id',
    'created_at',
    'updated_at',
];

export class AnalysisBucketRepositoryAdapter implements IAnalysisBucketRepository {
    protected dataSource: DataSource;

    protected repository: Repository<AnalysisBucketEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(AnalysisBucketEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisBucket>> {
        const {
            filter,
            page,
            fields,
            include,
            sort,
        } = query;

        const qb = this.repository.createQueryBuilder('analysisBucket');
        qb.groupBy('analysisBucket.id');

        const fieldsParsed = parseQueryFields<AnalysisBucketEntity>(fields, {
            default: DEFAULT_FIELDS as any,
            defaultPath: 'analysisBucket',
        });

        applyQueryFieldsParseOutput(qb, fieldsParsed, { defaultAlias: 'analysisBucket' });

        applyRelations(qb, include, {
            defaultAlias: 'analysisBucket',
            allowed: ['analysis'],
            onJoin: (_property, key, query) => {
                query.addGroupBy(`${key}.id`);
            },
        });

        applySort(qb, sort, {
            defaultAlias: 'analysisBucket',
            allowed: ['type', 'created_at', 'updated_at'],
        });

        applyFilters(qb, filter, {
            allowed: [
                'analysis_id',
                'type',
                'analysis.id',
                'analysis.name',
            ],
            defaultAlias: 'analysisBucket',
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

    async findOneById(id: string): Promise<AnalysisBucket | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<AnalysisBucket | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<AnalysisBucket[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<AnalysisBucket>): AnalysisBucket {
        return this.repository.create(data) as AnalysisBucket;
    }

    merge(entity: AnalysisBucket, data: Partial<AnalysisBucket>): AnalysisBucket {
        return this.repository.merge(entity as AnalysisBucketEntity, data) as AnalysisBucket;
    }

    async save(entity: AnalysisBucket, ctx?: EntityPersistContext): Promise<AnalysisBucket> {
        return this.repository.save(entity as AnalysisBucketEntity, ctx);
    }

    async remove(entity: AnalysisBucket, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as AnalysisBucketEntity, ctx);
    }

    async validateJoinColumns(data: Partial<AnalysisBucket>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: AnalysisBucketEntity,
        });
    }
}
