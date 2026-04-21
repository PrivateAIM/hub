/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isUUID } from '@authup/kit';
import type { Bucket } from '@privateaim/storage-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    applyQuery,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import { BucketEntity } from '../../../../../adapters/database/entities/bucket.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
    IBucketRepository,
} from '../../../../../core/entities/index.ts';

export class BucketRepositoryAdapter implements IBucketRepository {
    protected dataSource: DataSource;

    protected repository: Repository<BucketEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(BucketEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Bucket>> {
        const qb = this.repository.createQueryBuilder('bucket');
        qb.groupBy('bucket.id');

        const { pagination } = applyQuery(qb, query, {
            defaultAlias: 'bucket',
            fields: {
                default: [
                    'id',
                    'name',
                    'region',
                    'created_at',
                    'updated_at',
                    'realm_id',
                    'actor_id',
                    'actor_type',
                ],
            },
            filters: { allowed: ['id', 'name', 'realm_id', 'actor_type', 'actor_id'] },
            pagination: { maxLimit: 50 },
            sort: { allowed: ['id', 'updated_at', 'created_at'] },
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

    async findOneById(id: string): Promise<Bucket | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneByIdOrName(id: string): Promise<Bucket | null> {
        const qb = this.repository.createQueryBuilder('bucket');
        if (isUUID(id)) {
            qb.where('bucket.id = :id', { id });
        } else {
            qb.where('bucket.name = :name', { name: id });
        }
        return qb.getOne();
    }

    async findOneBy(where: Record<string, any>): Promise<Bucket | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<Bucket[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<Bucket>): Bucket {
        return this.repository.create(data) as Bucket;
    }

    merge(entity: Bucket, data: Partial<Bucket>): Bucket {
        return this.repository.merge(entity as BucketEntity, data) as Bucket;
    }

    async save(entity: Bucket, ctx?: EntityPersistContext): Promise<Bucket> {
        return this.repository.save(entity as BucketEntity, ctx);
    }

    async remove(entity: Bucket, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as BucketEntity, ctx);
    }

    async validateJoinColumns(data: Partial<Bucket>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: BucketEntity,
        });
    }
}
