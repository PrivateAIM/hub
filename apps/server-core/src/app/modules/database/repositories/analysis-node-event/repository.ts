/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeEvent } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    applyQuery,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import { AnalysisNodeEventEntity } from '../../../../../adapters/database/entities/analysis-node-event.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type { IAnalysisNodeEventRepository } from '../../../../../core/entities/analysis-node-event/types.ts';

export class AnalysisNodeEventRepositoryAdapter implements IAnalysisNodeEventRepository {
    protected dataSource: DataSource;

    protected repository: Repository<AnalysisNodeEventEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(AnalysisNodeEventEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisNodeEvent>> {
        const qb = this.repository.createQueryBuilder('e');
        qb.groupBy('e.id');

        const { pagination } = applyQuery(qb, query, {
            defaultAlias: 'e',
            filters: {
                allowed: [
                    'analysis_id',
                    'node_id',
                ],
            },
            pagination: { maxLimit: 50 },
            relations: {
                allowed: ['analysis', 'node'],
                onJoin: (_property, key, query) => {
                    query.addGroupBy(`${key}.id`);
                },
            },
            sort: {
                allowed: [
                    'created_at',
                    'updated_at',
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

    async findOneById(id: string): Promise<AnalysisNodeEvent | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<AnalysisNodeEvent | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<AnalysisNodeEvent[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<AnalysisNodeEvent>): AnalysisNodeEvent {
        return this.repository.create(data) as AnalysisNodeEvent;
    }

    merge(entity: AnalysisNodeEvent, data: Partial<AnalysisNodeEvent>): AnalysisNodeEvent {
        return this.repository.merge(entity as AnalysisNodeEventEntity, data) as AnalysisNodeEvent;
    }

    async save(entity: AnalysisNodeEvent, ctx?: EntityPersistContext): Promise<AnalysisNodeEvent> {
        return this.repository.save(entity as AnalysisNodeEventEntity, ctx);
    }

    async remove(entity: AnalysisNodeEvent, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as AnalysisNodeEventEntity, ctx);
    }

    async validateJoinColumns(data: Partial<AnalysisNodeEvent>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: AnalysisNodeEventEntity,
        });
    }
}
