/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IQuery } from '@rapiq/core';
import type { Event } from '@privateaim/telemetry-kit';
import type { DataSource, Repository } from 'typeorm';
import { In, LessThan } from 'typeorm';
import {
    validateEntityJoinColumns,
} from 'typeorm-extension';
import { EventEntity } from '../../../../../adapters/database/entities/event.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type { EventDeleteExpiredOptions, IEventRepository } from '../../../../../core/entities/index.ts';
import { EVENT_RETENTION_SWEEP_BATCH_SIZE } from '../../../../../core/entities/index.ts';
import { applyQuery } from '../query.ts';

export class EventRepositoryAdapter implements IEventRepository {
    protected dataSource: DataSource;

    protected repository: Repository<EventEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(EventEntity);
    }

    async findMany(query: IQuery): Promise<EntityRepositoryFindManyResult<Event>> {
        const qb = this.repository.createQueryBuilder('ev');
        qb.groupBy('ev.id');

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

    async deleteExpired(now: string, options: EventDeleteExpiredOptions = {}): Promise<number> {
        // A non-positive or non-integral size must never reach `take`: typeorm
        // ignores a falsy one, which would silently restore the single
        // unbounded select this batching exists to prevent, and the rest reach
        // the driver as invalid SQL. Fall back to the default instead.
        const requested = options.batchSize;
        const batchSize = typeof requested === 'number' &&
            Number.isSafeInteger(requested) &&
            requested > 0 ?
            requested :
            EVENT_RETENTION_SWEEP_BATCH_SIZE;

        let total = 0;

        for (;;) {
            // ids only: the row carries a `text` data blob behind a deserialize
            // transformer, and nothing but the id is needed to delete it.
            const rows = await this.repository.find({
                select: { id: true },
                where: {
                    expiring: true,
                    expiresAt: LessThan(now),
                },
                take: batchSize,
            });

            if (rows.length === 0) {
                break;
            }

            const result = await this.repository.delete({ id: In(rows.map((row) => row.id)) });

            // A driver that does not report affected rows still made progress,
            // so count the batch rather than returning 0.
            total += result.affected ?? rows.length;

            // Another replica's sweep already owns these rows. Stop rather than
            // re-selecting them; the next tick picks up whatever is left.
            if (result.affected === 0) {
                break;
            }

            if (rows.length < batchSize) {
                break;
            }
        }

        return total;
    }

    async validateJoinColumns(data: Partial<Event>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: EventEntity,
        });
    }
}
