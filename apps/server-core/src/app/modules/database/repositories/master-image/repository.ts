/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IQuery } from '@rapiq/core';
import type { MasterImage } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    validateEntityJoinColumns,
} from 'typeorm-extension';
import { MasterImageEntity } from '../../../../../adapters/database/entities/master-image.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type {
    IMasterImageRepository,
} from '../../../../../core/index.ts';
import { applyQuery } from '../query.ts';

export class MasterImageRepositoryAdapter implements IMasterImageRepository {
    protected dataSource: DataSource;

    protected repository: Repository<MasterImageEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(MasterImageEntity);
    }

    async findMany(query: IQuery): Promise<EntityRepositoryFindManyResult<MasterImage>> {
        const qb = this.repository.createQueryBuilder('image');
        qb.groupBy('image.id');

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

    async findOneById(id: string): Promise<MasterImage | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<MasterImage | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<MasterImage[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<MasterImage>): MasterImage {
        return this.repository.create(data) as MasterImage;
    }

    merge(entity: MasterImage, data: Partial<MasterImage>): MasterImage {
        return this.repository.merge(entity as MasterImageEntity, data) as MasterImage;
    }

    async save(entity: MasterImage, ctx?: EntityPersistContext): Promise<MasterImage> {
        return this.repository.save(entity as MasterImageEntity, ctx);
    }

    async remove(entity: MasterImage, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as MasterImageEntity, ctx);
    }

    async validateJoinColumns(data: Partial<MasterImage>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: MasterImageEntity,
        });
    }
}
