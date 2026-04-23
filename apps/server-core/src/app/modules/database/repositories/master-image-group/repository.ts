/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageGroup } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    applyQuery,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import { MasterImageGroupEntity } from '../../../../../adapters/database/entities/master-image-group.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type {
    IMasterImageGroupRepository,
} from '../../../../../core/index.ts';

export class MasterImageGroupRepositoryAdapter implements IMasterImageGroupRepository {
    protected dataSource: DataSource;

    protected repository: Repository<MasterImageGroupEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(MasterImageGroupEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<MasterImageGroup>> {
        const qb = this.repository.createQueryBuilder('imageGroup');
        qb.groupBy('imageGroup.id');

        const { pagination } = applyQuery(qb, query, {
            defaultAlias: 'imageGroup',
            filters: { allowed: ['id', 'name', 'path', 'virtual_path'] },
            pagination: { maxLimit: 50 },
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

    async findOneById(id: string): Promise<MasterImageGroup | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<MasterImageGroup | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<MasterImageGroup[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<MasterImageGroup>): MasterImageGroup {
        return this.repository.create(data) as MasterImageGroup;
    }

    merge(entity: MasterImageGroup, data: Partial<MasterImageGroup>): MasterImageGroup {
        return this.repository.merge(entity as MasterImageGroupEntity, data) as MasterImageGroup;
    }

    async save(entity: MasterImageGroup, ctx?: EntityPersistContext): Promise<MasterImageGroup> {
        return this.repository.save(entity as MasterImageGroupEntity, ctx);
    }

    async remove(entity: MasterImageGroup, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as MasterImageGroupEntity, ctx);
    }

    async validateJoinColumns(data: Partial<MasterImageGroup>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: MasterImageGroupEntity,
        });
    }
}
