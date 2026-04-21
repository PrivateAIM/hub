/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BucketFile } from '@privateaim/storage-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    applyQuery,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import { BucketFileEntity } from '../../../../../adapters/database/entities/bucket-file.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
    IBucketFileRepository,
} from '../../../../../core/entities/index.ts';

export class BucketFileRepositoryAdapter implements IBucketFileRepository {
    protected dataSource: DataSource;

    protected repository: Repository<BucketFileEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(BucketFileEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<BucketFile>> {
        const qb = this.repository.createQueryBuilder('bucketFile');
        qb.groupBy('bucketFile.id');

        const { pagination } = applyQuery(qb, query, {
            defaultAlias: 'bucketFile',
            fields: {
                default: [
                    'id',
                    'name',
                    'path',
                    'directory',
                    'size',
                    'hash',
                    'created_at',
                    'updated_at',
                    'realm_id',
                    'actor_type',
                    'actor_id',
                    'bucket_id',
                ],
            },
            relations: {
                allowed: ['bucket'],
                onJoin: (_property, key, query) => {
                    query.addGroupBy(`${key}.id`);
                },
            },
            filters: {
                allowed: [
                    'id',
                    'name',
                    'directory',
                    'realm_id',
                    'actor_type',
                    'actor_id',
                    'bucket_id',
                ],
            },
            pagination: { maxLimit: 50 },
            sort: { allowed: ['id', 'directory', 'name', 'updated_at', 'created_at'] },
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

    async findOneById(id: string): Promise<BucketFile | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<BucketFile | null> {
        return this.repository.findOne({ where, relations: ['bucket'] });
    }

    async findManyBy(where: Record<string, any>): Promise<BucketFile[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<BucketFile>): BucketFile {
        return this.repository.create(data) as BucketFile;
    }

    merge(entity: BucketFile, data: Partial<BucketFile>): BucketFile {
        return this.repository.merge(entity as BucketFileEntity, data) as BucketFile;
    }

    async save(entity: BucketFile, ctx?: EntityPersistContext): Promise<BucketFile> {
        return this.repository.save(entity as BucketFileEntity, ctx);
    }

    async remove(entity: BucketFile, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as BucketFileEntity, ctx);
    }

    async validateJoinColumns(data: Partial<BucketFile>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: BucketFileEntity,
        });
    }
}
