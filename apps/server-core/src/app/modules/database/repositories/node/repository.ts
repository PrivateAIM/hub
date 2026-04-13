/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    applyFilters,
    applyPagination,
    applyQueryFieldsParseOutput,
    applyRelations,
    applySort,
    validateEntityJoinColumns,
} from 'typeorm-extension';
import { parseQueryFields } from 'rapiq';
import { NodeEntity } from '../../../../../adapters/database/entities/node.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
    INodeRepository,
} from '../../../../../core/index.ts';

const DEFAULT_FIELDS: (keyof NodeEntity)[] = [
    'id',
    'name',
    'client_id',
    'external_name',
    'hidden',
    'type',
    'online',
    'public_key',
    'robot_id',
    'realm_id',
    'registry_id',
    'registry_project_id',
    'created_at',
    'updated_at',
];

export class NodeRepositoryAdapter implements INodeRepository {
    protected dataSource: DataSource;

    protected repository: Repository<NodeEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(NodeEntity);
    }

    async findMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Node>> {
        const {
            filter,
            page,
            fields,
            include,
            sort,
        } = query;

        const qb = this.repository.createQueryBuilder('node');
        qb.groupBy('node.id');

        const fieldsParsed = parseQueryFields<NodeEntity>(fields, {
            default: DEFAULT_FIELDS as any,
            defaultPath: 'node',
        });

        applyQueryFieldsParseOutput(qb, fieldsParsed, { defaultAlias: 'node' });

        applyRelations(qb, include, {
            defaultAlias: 'node',
            allowed: ['registry_project', 'registry'],
            onJoin: (_property, key, query) => {
                query.addGroupBy(`${key}.id`);
            },
        });

        applySort(qb, sort, {
            defaultAlias: 'node',
            allowed: ['name', 'updated_at', 'created_at'],
        });

        applyFilters(qb, filter, {
            allowed: ['id', 'name', 'online', 'hidden', 'client_id', 'realm_id', 'robot_id'],
            defaultAlias: 'node',
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

    async findOneById(id: string): Promise<Node | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneWithExternalName(id: string): Promise<Node | null> {
        const qb = this.repository.createQueryBuilder('node')
            .addSelect(['node.external_name'])
            .where('node.id = :id', { id });

        return qb.getOne();
    }

    async findOneBy(where: Record<string, any>): Promise<Node | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<Node[]> {
        return this.repository.findBy(where);
    }

    create(data: Partial<Node>): Node {
        return this.repository.create(data) as Node;
    }

    merge(entity: Node, data: Partial<Node>): Node {
        return this.repository.merge(entity as NodeEntity, data) as Node;
    }

    async save(entity: Node, ctx?: EntityPersistContext): Promise<Node> {
        return this.repository.save(entity as NodeEntity, ctx);
    }

    async remove(entity: Node, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(entity as NodeEntity, ctx);
    }

    async validateJoinColumns(data: Partial<Node>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: NodeEntity,
        });
    }
}
