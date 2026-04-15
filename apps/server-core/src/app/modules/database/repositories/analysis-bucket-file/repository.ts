/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile } from '@privateaim/core-kit';
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
import { AnalysisBucketFileEntity } from '../../../../../adapters/database/entities/analysis-bucket-file.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
    IAnalysisBucketFileRepository,
} from '../../../../../core/index.ts';

const DEFAULT_FIELDS: ParseAllowedOption<AnalysisBucketFileEntity> = [
    'id',
    'path',
    'root',
    'bucket_id',
    'bucket_file_id',
    'client_id',
    'robot_id',
    'user_id',
    'realm_id',
    'analysis_id',
    'analysis_bucket_id',
    'created_at',
    'updated_at',
];

export class AnalysisBucketFileRepositoryAdapter implements IAnalysisBucketFileRepository {
    protected dataSource: DataSource;

    protected repository: Repository<AnalysisBucketFileEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(AnalysisBucketFileEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisBucketFile>> {
        const {
            filter,
            page,
            fields,
            include,
            sort,
        } = query;

        const qb = this.repository.createQueryBuilder('analysisBucketFile');
        qb.groupBy('analysisBucketFile.id');

        const fieldsParsed = parseQueryFields<AnalysisBucketFileEntity>(fields, {
            default: DEFAULT_FIELDS,
            defaultPath: 'analysisBucketFile',
        });

        applyQueryFieldsParseOutput(qb, fieldsParsed, { defaultAlias: 'analysisBucketFile' });

        applyRelations(qb, include, {
            defaultAlias: 'analysisBucketFile',
            allowed: ['analysis', 'analysis_bucket'],
            onJoin: (_property, key, query) => {
                query.addGroupBy(`${key}.id`);
            },
        });

        applySort(qb, sort, {
            defaultAlias: 'analysisBucketFile',
            allowed: ['path', 'created_at', 'updated_at'],
        });

        applyFilters(qb, filter, {
            allowed: [
                'path',
                'root',
                'analysis_bucket_id',
                'analysis_id',
                'analysis.id',
                'analysis.name',
                'analysis_bucket.type',
            ],
            defaultAlias: 'analysisBucketFile',
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

    async findOneById(id: string): Promise<AnalysisBucketFile | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<AnalysisBucketFile | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<AnalysisBucketFile[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<AnalysisBucketFile>): AnalysisBucketFile {
        return this.repository.create(data) as AnalysisBucketFile;
    }

    merge(entity: AnalysisBucketFile, data: Partial<AnalysisBucketFile>): AnalysisBucketFile {
        return this.repository.merge(entity as AnalysisBucketFileEntity, data) as AnalysisBucketFile;
    }

    async save(entity: AnalysisBucketFile, ctx?: EntityPersistContext): Promise<AnalysisBucketFile> {
        return this.repository.save(entity as AnalysisBucketFileEntity, ctx);
    }

    async remove(entity: AnalysisBucketFile, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as AnalysisBucketFileEntity, ctx);
    }

    async validateJoinColumns(data: Partial<AnalysisBucketFile>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: AnalysisBucketFileEntity,
        });
    }
}
