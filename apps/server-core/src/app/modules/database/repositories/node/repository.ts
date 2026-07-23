/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '@privateaim/core-kit';
import type { DataSource, Repository } from 'typeorm';
import {
    validateEntityJoinColumns,
} from 'typeorm-extension';
import type { IQuery } from '@rapiq/core';
import { NodeEntity } from '../../../../../adapters/database/entities/node.ts';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type {
    INodeRepository,
} from '../../../../../core/index.ts';
import { applyQuery } from '../query.ts';

export class NodeRepositoryAdapter implements INodeRepository {
    protected dataSource: DataSource;

    protected repository: Repository<NodeEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(NodeEntity);
    }

    async findMany(query: IQuery): Promise<EntityRepositoryFindManyResult<Node>> {
        const qb = this.repository.createQueryBuilder('node');
        qb.groupBy('node.id');

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
