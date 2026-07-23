/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile } from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    validateEntityJoinColumns,
} from 'typeorm-extension';
import type { IQuery } from '@rapiq/core';
import { AnalysisBucketFileEntity } from '../../../../../adapters/database/entities/analysis-bucket-file.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type {
    IAnalysisBucketFileRepository,
} from '../../../../../core/index.ts';
import { applyQuery } from '../query.ts';

export class AnalysisBucketFileRepositoryAdapter implements IAnalysisBucketFileRepository {
    protected dataSource: DataSource;

    protected repository: Repository<AnalysisBucketFileEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(AnalysisBucketFileEntity);
    }

    async findMany(query: IQuery): Promise<EntityRepositoryFindManyResult<AnalysisBucketFile>> {
        const qb = this.repository.createQueryBuilder('analysisBucketFile');
        qb.groupBy('analysisBucketFile.id');

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

    async findOneById(id: string): Promise<AnalysisBucketFile | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<AnalysisBucketFile | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<AnalysisBucketFile[]> {
        return this.repository.findBy(where);
    }

    async findRootCodeFile(analysisId: string): Promise<AnalysisBucketFile | null> {
        return this.repository.findOne({
            where: {
                analysis_id: analysisId,
                root: true,
                analysis_bucket: { type: AnalysisBucketType.CODE },
            },
            relations: { analysis_bucket: true },
        });
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
