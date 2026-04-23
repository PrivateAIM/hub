/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    applyFilters,
    applyPagination,
    applyQueryFieldsParseOutput,
    applyRelations,
    applySort,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import type { ParseAllowedOption } from 'rapiq';
import { parseQueryFields } from 'rapiq';
import { RegistryProjectEntity } from '../../../../../adapters/database/entities/registry-project.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type {
    IRegistryProjectRepository,
} from '../../../../../core/index.ts';

const DEFAULT_FIELDS: ParseAllowedOption<RegistryProjectEntity> = [
    'id',
    'name',
    'type',
    'public',
    'external_name',
    'external_id',
    'account_id',
    'account_name',
    'webhook_name',
    'webhook_exists',
    'registry_id',
    'realm_id',
    'created_at',
    'updated_at',
];

const ALLOWED_FIELDS: ParseAllowedOption<RegistryProjectEntity> = [
    ...DEFAULT_FIELDS,
    'account_secret',
];

export class RegistryProjectRepositoryAdapter implements IRegistryProjectRepository {
    protected dataSource: DataSource;

    protected repository: Repository<RegistryProjectEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(RegistryProjectEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<RegistryProject>> {
        const {
            filter,
            page,
            fields,
            include,
            sort,
        } = query;

        const qb = this.repository.createQueryBuilder('registryProject');
        qb.groupBy('registryProject.id');

        const fieldsParsed = parseQueryFields<RegistryProjectEntity>(fields, {
            default: DEFAULT_FIELDS,
            allowed: ALLOWED_FIELDS,
            defaultPath: 'registryProject',
        });

        applyQueryFieldsParseOutput(qb, fieldsParsed, { defaultAlias: 'registryProject' });

        applyRelations(qb, include, {
            defaultAlias: 'registryProject',
            allowed: ['registry'],
            onJoin: (_property, key, query) => {
                query.addGroupBy(`${key}.id`);
            },
        });

        applySort(qb, sort, {
            defaultAlias: 'registryProject',
            allowed: ['id', 'updated_at', 'created_at'],
        });

        applyFilters(qb, filter, {
            allowed: ['id', 'name', 'registry_id', 'external_name', 'type'],
            defaultAlias: 'registryProject',
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

    async findOneById(id: string): Promise<RegistryProject | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<RegistryProject | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<RegistryProject[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<RegistryProject>): RegistryProject {
        return this.repository.create(data) as RegistryProject;
    }

    merge(entity: RegistryProject, data: Partial<RegistryProject>): RegistryProject {
        return this.repository.merge(entity as RegistryProjectEntity, data) as RegistryProject;
    }

    async save(entity: RegistryProject, ctx?: EntityPersistContext): Promise<RegistryProject> {
        return this.repository.save(entity as RegistryProjectEntity, ctx);
    }

    async remove(entity: RegistryProject, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as RegistryProjectEntity, ctx);
    }

    async validateJoinColumns(data: Partial<RegistryProject>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: RegistryProjectEntity,
        });
    }
}
