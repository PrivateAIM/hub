/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Project } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    applyFilters,
    applyPagination,
    applyQueryFieldsParseOutput,
    applyRelations,
    applySort,
    isEntityUnique,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import type { ParseAllowedOption } from 'rapiq';
import { parseQueryFields } from 'rapiq';
import { ProjectEntity } from '../../../../../adapters/database/entities/project.ts';
import { DatabaseConflictError } from '../../../../../adapters/database/error/index.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type {
    IProjectRepository,
} from '../../../../../core/index.ts';

const DEFAULT_FIELDS: ParseAllowedOption<ProjectEntity> = [
    'id',
    'name',
    'description',
    'nodes',
    'analyses',
    'created_at',
    'updated_at',
    'realm_id',
    'client_id',
    'robot_id',
    'user_id',
    'master_image_id',
];

export class ProjectRepositoryAdapter implements IProjectRepository {
    protected dataSource: DataSource;

    protected repository: Repository<ProjectEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(ProjectEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Project>> {
        const {
            filter,
            page,
            fields,
            include,
            sort,
        } = query;

        const qb = this.repository.createQueryBuilder('project');
        qb.groupBy('project.id');

        const fieldsParsed = parseQueryFields<ProjectEntity>(fields, {
            default: DEFAULT_FIELDS,
            defaultPath: 'project',
        });

        applyQueryFieldsParseOutput(qb, fieldsParsed, { defaultAlias: 'project' });

        applyRelations(qb, include, {
            defaultAlias: 'project',
            allowed: ['master_image'],
            onJoin: (_property, key, query) => {
                query.addGroupBy(`${key}.id`);
            },
        });

        applySort(qb, sort, {
            defaultAlias: 'project',
            allowed: ['id', 'updated_at', 'created_at'],
        });

        applyFilters(qb, filter, {
            allowed: ['id', 'name', 'realm_id', 'user_id'],
            defaultAlias: 'project',
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

    async findOneById(id: string): Promise<Project | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<Project | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<Project[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<Project>): Project {
        return this.repository.create(data) as Project;
    }

    merge(entity: Project, data: Partial<Project>): Project {
        return this.repository.merge(entity as ProjectEntity, data) as Project;
    }

    async save(entity: Project, ctx?: EntityPersistContext): Promise<Project> {
        return this.repository.save(entity as ProjectEntity, ctx);
    }

    async remove(entity: Project, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as ProjectEntity, ctx);
    }

    async validateJoinColumns(data: Partial<Project>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: ProjectEntity,
        });
    }

    async checkUniqueness(data: Partial<Project>, existing?: Project): Promise<void> {
        const isUnique = await isEntityUnique({
            entity: data,
            entityTarget: ProjectEntity,
            entityExisting: existing,
            dataSource: this.dataSource,
        });
        if (!isUnique) {
            throw new DatabaseConflictError();
        }
    }
}
