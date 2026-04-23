/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Event } from '@privateaim/telemetry-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    applyQuery,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import { EventEntity } from '../../../../../adapters/database/entities/event.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type { IEventRepository } from '../../../../../core/entities/index.ts';

export class EventRepositoryAdapter implements IEventRepository {
    protected dataSource: DataSource;

    protected repository: Repository<EventEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(EventEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Event>> {
        const qb = this.repository.createQueryBuilder('ev');
        qb.groupBy('ev.id');

        const { pagination } = applyQuery(qb, query, {
            defaultAlias: 'ev',
            filters: {
                allowed: [
                    'scope',
                    'name',
                    'ref_type',
                    'ref_id',
                    'realm_id',
                    'created_at',
                    'updated_at',
                ],
            },
            pagination: { maxLimit: 50 },
            relations: {
                allowed: [],
                onJoin: (_property, key, query) => {
                    query.addGroupBy(`${key}.id`);
                },
            },
            sort: {
                allowed: [
                    'expires_at',
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

    async findOneById(id: string): Promise<Event | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<Event | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<Event[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<Event>): Event {
        return this.repository.create(data) as Event;
    }

    merge(entity: Event, data: Partial<Event>): Event {
        return this.repository.merge(entity as EventEntity, data) as Event;
    }

    async save(entity: Event, ctx?: EntityPersistContext): Promise<Event> {
        return this.repository.save(entity as EventEntity, ctx);
    }

    async remove(entity: Event, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as EventEntity, ctx);
    }

    async validateJoinColumns(data: Partial<Event>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: EventEntity,
        });
    }
}
