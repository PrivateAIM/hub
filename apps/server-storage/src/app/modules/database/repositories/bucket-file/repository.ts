/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IQuery } from '@rapiq/core';
import type { BucketFile } from '@privateaim/storage-kit';
import type { DataSource, Repository } from 'typeorm';
import { validateEntityJoinColumns } from 'typeorm-extension';
import { BucketFileEntity } from '../../../../../adapters/database/entities/bucket-file.ts';
import type { EntityPersistContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import type { IBucketFileRepository } from '../../../../../core/entities/index.ts';
import { applyQuery } from '../query.ts';

export class BucketFileRepositoryAdapter implements IBucketFileRepository {
    protected dataSource: DataSource;

    protected repository: Repository<BucketFileEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(BucketFileEntity);
    }

    async findMany(query: IQuery): Promise<EntityRepositoryFindManyResult<BucketFile>> {
        const qb = this.repository.createQueryBuilder('bucketFile');
        qb.groupBy('bucketFile.id');

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

    async findOneById(id: string): Promise<BucketFile | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<BucketFile | null> {
        return this.repository.findOne({ where, relations: { bucket: true } });
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
