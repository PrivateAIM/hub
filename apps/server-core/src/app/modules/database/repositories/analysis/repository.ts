/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type { DataSource, Repository } from 'typeorm';
import { In, Raw } from 'typeorm';
import {
    validateEntityJoinColumns,
} from 'typeorm-extension';
import type { IQuery } from '@rapiq/core';
import { AnalysisEntity } from '../../../../../adapters/database/entities/analysis.ts';
import { updateLockedEntity } from '../../../../../adapters/database/locked-update.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type {
    IAnalysisRepository,
} from '../../../../../core/index.ts';
import { applyQuery } from '../query.ts';

export class AnalysisRepositoryAdapter implements IAnalysisRepository {
    protected dataSource: DataSource;

    protected repository: Repository<AnalysisEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(AnalysisEntity);
    }

    async findMany(query: IQuery): Promise<EntityRepositoryFindManyResult<Analysis>> {
        const qb = this.repository.createQueryBuilder('analysis');

        qb.groupBy('analysis.id');

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

    async findOneById(id: string): Promise<Analysis | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneWithProject(id: string): Promise<Analysis | null> {
        return this.repository.findOne({ where: { id }, relations: { project: true } });
    }

    async countByProject(projectId: string): Promise<number> {
        return this.repository.countBy({ projectId });
    }

    async findManyInProgressUpdatedBefore(updatedBefore: Date): Promise<Analysis[]> {
        const inProgress = In([ProcessStatus.STARTING, ProcessStatus.STARTED]);
        // Raw, not LessThan: `updatedAt` is typed as an ISO string, but the
        // bind must stay a Date — MySQL truncates an ISO string's trailing
        // `Z` when casting it to a datetime (timestamp-filter trap).
        const updatedAt = Raw((alias) => `${alias} < :updatedBefore`, { updatedBefore });

        // ponytail: unbounded — only rows stuck past the stale threshold match,
        // a handful at most. Page it if that ever stops being true.
        return this.repository.find({
            where: [
                { buildStatus: inProgress, updatedAt },
                { distributionStatus: inProgress, updatedAt },
            ],
        });
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

    async updateLocked(id: string, fn: (entity: Analysis) => boolean, ctx?: EntityPersistContext): Promise<Analysis | null> {
        return updateLockedEntity(this.dataSource, AnalysisEntity, { id }, fn, ctx);
    }

    async remove(entity: Analysis, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as AnalysisEntity, ctx);
    }

    async removeMany(entities: Analysis[], ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entities as AnalysisEntity[], ctx);
    }

    async validateJoinColumns(data: Partial<Analysis>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: AnalysisEntity,
        });
    }
}
