/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    applyFilters,
    applyPagination,
    applyQueryFieldsParseOutput,
    applySort,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import type { ParseAllowedOption } from 'rapiq';
import { parseQueryFields } from 'rapiq';
import { RegistryEntity } from '../../../../../adapters/database/entities/registry.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type {
    IRegistryRepository,
} from '../../../../../core/index.ts';

const DEFAULT_FIELDS: ParseAllowedOption<RegistryEntity> = [
    'id',
    'name',
    'host',
    'account_name',
    'created_at',
    'updated_at',
];

const ALLOWED_FIELDS: ParseAllowedOption<RegistryEntity> = [
    ...DEFAULT_FIELDS,
    'account_secret',
];

export class RegistryRepositoryAdapter implements IRegistryRepository {
    protected dataSource: DataSource;

    protected repository: Repository<RegistryEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(RegistryEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Registry>> {
        const {
            filter,
            page,
            fields,
            sort,
        } = query;

        const qb = this.repository.createQueryBuilder('registry');
        qb.groupBy('registry.id');

        const fieldsParsed = parseQueryFields<RegistryEntity>(fields, {
            default: DEFAULT_FIELDS,
            allowed: ALLOWED_FIELDS,
            defaultPath: 'registry',
        });

        applyQueryFieldsParseOutput(qb, fieldsParsed, { defaultAlias: 'registry' });

        applyFilters(qb, filter, {
            defaultAlias: 'registry',
            allowed: ['id', 'name'],
        });

        applySort(qb, sort, {
            defaultAlias: 'registry',
            allowed: ['id', 'updated_at', 'created_at'],
        });

        const pagination = applyPagination(qb, page, { maxLimit: 50 });

        const [entities, total] = await qb.getManyAndCount();

        return {
            data: entities,
            meta: {
                total,
                ...pagination,
            },
        };
    }

    async findOneById(id: string): Promise<Registry | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneWithSecret(id: string): Promise<Registry | null> {
        const qb = this.repository.createQueryBuilder('registry')
            .addSelect(['registry.account_secret'])
            .where('registry.id = :id', { id });

        return qb.getOne();
    }

    async findOneBy(where: Record<string, any>): Promise<Registry | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<Registry[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<Registry>): Registry {
        return this.repository.create(data) as Registry;
    }

    merge(entity: Registry, data: Partial<Registry>): Registry {
        return this.repository.merge(entity as RegistryEntity, data) as Registry;
    }

    async save(entity: Registry, ctx?: EntityPersistContext): Promise<Registry> {
        return this.repository.save(entity as RegistryEntity, ctx);
    }

    async remove(entity: Registry, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as RegistryEntity, ctx);
    }

    async validateJoinColumns(data: Partial<Registry>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: RegistryEntity,
        });
    }
}
