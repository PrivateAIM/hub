/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeComponent } from '@privateaim/core-kit';
import type {
    EntityPersistContext,
    EntityRepositoryFindManyResult,
} from '@privateaim/server-kit';
import type { IQuery } from '@rapiq/core';
import type {
    DataSource,
    EntityManager,
    FindOneOptions,
    Repository,
} from 'typeorm';
import { isRowLockSupported, validateEntityJoinColumns } from 'typeorm-extension';
import { NodeComponentEntity } from '../../../../../adapters/database/entities/node-component.ts';
import { NodeEntity } from '../../../../../adapters/database/entities/node.ts';
import type { INodeComponentRepository, NodeComponentWrite } from '../../../../../core/index.ts';
import { mergeNodeComponent } from '../../../../../core/services/node-status/merge.ts';
import { applyQuery } from '../query.ts';

export class NodeComponentRepositoryAdapter implements INodeComponentRepository {
    protected dataSource: DataSource;

    protected repository: Repository<NodeComponentEntity>;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        this.repository = dataSource.getRepository(NodeComponentEntity);
    }

    async findMany(query: IQuery): Promise<EntityRepositoryFindManyResult<NodeComponent>> {
        const qb = this.repository.createQueryBuilder('nodeComponent');

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

    async findOneById(id: string): Promise<NodeComponent | null> {
        return this.repository.findOneBy({ id });
    }

    async findOneBy(where: Record<string, any>): Promise<NodeComponent | null> {
        return this.repository.findOneBy(where);
    }

    async findManyBy(where: Record<string, any>): Promise<NodeComponent[]> {
        return this.repository.findBy(where);
    }

    async replaceForNode(nodeId: string, writes: NodeComponentWrite[], reportedAt: string): Promise<NodeComponent[]> {
        return this.withNodeLock(nodeId, async (manager, stored) => {
            const named = new Set(writes.map((write) => write.name));
            const removed = stored.filter((row) => !named.has(row.name));

            if (removed.length > 0) {
                await manager.remove(NodeComponentEntity, removed);
            }

            const output: NodeComponent[] = [];

            for (const write of writes) {
                output.push(await this.upsert(manager, nodeId, stored, write, reportedAt));
            }

            return output;
        });
    }

    async upsertForNode(nodeId: string, write: NodeComponentWrite, reportedAt: string): Promise<NodeComponent> {
        return this.withNodeLock(
            nodeId,
            async (manager, stored) => this.upsert(manager, nodeId, stored, write, reportedAt),
        );
    }

    async findStaleOnlineNodeIds(before: string): Promise<string[]> {
        // "newest reportedAt < before" is "no component reported since", which
        // also covers a node without components. Bound as a Date: MySQL
        // truncates an ISO string's trailing `Z` when casting it to a datetime.
        const rows = await this.dataSource.getRepository(NodeEntity)
            .createQueryBuilder('node')
            .select('node.id', 'id')
            .where('node.online = :online', { online: true })
            .andWhere((qb) => {
                const fresh = qb.subQuery()
                    .select('1')
                    .from(NodeComponentEntity, 'component')
                    .where('component.nodeId = node.id')
                    .andWhere('component.reportedAt >= :before')
                    .getQuery();

                return `NOT EXISTS ${fresh}`;
            })
            .setParameter('before', new Date(before))
            .getRawMany<{ id: string }>();

        return rows.map((row) => row.id);
    }

    create(data: Partial<NodeComponent>): NodeComponent {
        return this.repository.create(data);
    }

    merge(entity: NodeComponent, data: Partial<NodeComponent>): NodeComponent {
        return this.repository.merge(this.toEntity(entity), data);
    }

    async save(entity: NodeComponent, ctx?: EntityPersistContext): Promise<NodeComponent> {
        return this.repository.save(entity, ctx);
    }

    async remove(entity: NodeComponent, ctx?: EntityPersistContext): Promise<void> {
        await this.repository.remove(this.toEntity(entity), ctx);
    }

    async validateJoinColumns(data: Partial<NodeComponent>): Promise<void> {
        await validateEntityJoinColumns(data, {
            dataSource: this.dataSource,
            entityTarget: NodeComponentEntity,
        });
    }

    /**
     * The row itself when it came from this adapter, so `merge` mutates it
     * in place like typeorm's does; otherwise an entity built from it.
     */
    protected toEntity(entity: NodeComponent): NodeComponentEntity {
        if (entity instanceof NodeComponentEntity) {
            return entity;
        }

        return this.repository.create(entity);
    }

    /**
     * Run `fn` in one transaction that holds a write lock on the node row, so
     * a snapshot and a component report for the same node serialize, and
     * hand it the node's components as they are after the lock was taken.
     *
     * better-sqlite3 has no row locks (typeorm throws
     * LockNotSupportedOnGivenDriverError), so it runs unlocked. Its one
     * shared connection cannot start a second transaction while one is open,
     * so a concurrent write fails there instead of waiting; accepted for a
     * dev/test driver.
     */
    protected async withNodeLock<T>(
        nodeId: string,
        fn: (manager: EntityManager, stored: NodeComponentEntity[]) => Promise<T>,
    ): Promise<T> {
        return this.dataSource.transaction(async (manager) => {
            const lock: Pick<FindOneOptions, 'lock'> = isRowLockSupported(manager) ?
                { lock: { mode: 'pessimistic_write' } } :
                {};

            await manager.findOne(NodeEntity, {
                select: { id: true },
                where: { id: nodeId },
                ...lock,
            });

            // A locking read: under MySQL's REPEATABLE READ a plain read could
            // return a snapshot older than the writer that held the lock before.
            const stored = await manager.find(NodeComponentEntity, {
                where: { nodeId },
                ...lock,
            });

            return fn(manager, stored);
        });
    }

    protected async upsert(
        manager: EntityManager,
        nodeId: string,
        stored: NodeComponentEntity[],
        write: NodeComponentWrite,
        reportedAt: string,
    ): Promise<NodeComponent> {
        const current = stored.find((row) => row.name === write.name);
        const data = mergeNodeComponent(current, write.report, reportedAt);

        const entity = current ?
            manager.merge(NodeComponentEntity, current, data) :
            manager.create(NodeComponentEntity, {
                ...data, 
                nodeId, 
                name: write.name, 
            });

        return manager.save(NodeComponentEntity, entity);
    }
}
