/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeComponent } from '@privateaim/core-kit';
import { EntityNotFoundError } from '@privateaim/errors';
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
import type {
    INodeComponentRepository,
    NodeComponentWrite,
    NodeComponentWriteOptions,
} from '../../../../../core/index.ts';
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

    async replaceForNode(
        nodeId: string,
        writes: NodeComponentWrite[],
        reportedAt: string,
        options: NodeComponentWriteOptions = {},
    ): Promise<NodeComponent[]> {
        return this.withNodeLock(nodeId, async (manager, node, stored) => {
            const named = new Set(writes.map((write) => write.name));
            const removed = stored.filter((row) => !named.has(row.name));

            if (removed.length > 0) {
                await manager.remove(NodeComponentEntity, removed);
            }

            const output: NodeComponent[] = [];

            for (const write of writes) {
                output.push(await this.upsert(manager, nodeId, stored, write, reportedAt));
            }

            await this.touch(manager, node, options);

            return output;
        });
    }

    async upsertForNode(
        nodeId: string,
        write: NodeComponentWrite,
        reportedAt: string,
        options: NodeComponentWriteOptions = {},
    ): Promise<NodeComponent> {
        return this.withNodeLock(nodeId, async (manager, node, stored) => {
            const output = await this.upsert(manager, nodeId, stored, write, reportedAt);

            await this.touch(manager, node, options);

            return output;
        });
    }

    async markOfflineIfStale(nodeId: string, before: string, ctx?: EntityPersistContext): Promise<boolean> {
        try {
            return await this.withNodeLock(nodeId, async (manager, node, stored) => {
                if (!node.online) {
                    return false;
                }

                // `stored` is read after the lock, so it holds every report
                // committed before this sweep got the node.
                const threshold = new Date(before).getTime();
                const fresh = stored.some((row) => new Date(row.reportedAt).getTime() >= threshold);

                if (fresh) {
                    return false;
                }

                node.online = false;
                await manager.save(NodeEntity, node, ctx);

                return true;
            });
        } catch (e) {
            // deleted since the candidate query
            if (e instanceof EntityNotFoundError) {
                return false;
            }

            throw e;
        }
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
     * The node half of a write, on the locked row in the same transaction,
     * so NodeSubscriber and the read-cache invalidation fire as for any save.
     */
    protected async touch(
        manager: EntityManager,
        node: NodeEntity,
        options: NodeComponentWriteOptions,
    ): Promise<void> {
        if (options.touch && options.touch(node)) {
            await manager.save(NodeEntity, node, options.ctx);
        }
    }

    /**
     * Run `fn` in one transaction that holds a write lock on the node row, so
     * snapshots, component reports and the offline sweep for the same node
     * serialize, each with its node update. `fn` gets the locked node row and
     * the node's components as they are after the lock was taken. Throws
     * EntityNotFoundError when the node does not exist.
     *
     * better-sqlite3 has no row locks (typeorm throws
     * LockNotSupportedOnGivenDriverError), so it runs unlocked. Its one
     * shared connection cannot start a second transaction while one is open,
     * so a concurrent write fails there instead of waiting; accepted for a
     * dev/test driver.
     */
    protected async withNodeLock<T>(
        nodeId: string,
        fn: (manager: EntityManager, node: NodeEntity, stored: NodeComponentEntity[]) => Promise<T>,
    ): Promise<T> {
        return this.dataSource.transaction(async (manager) => {
            const lock: Pick<FindOneOptions, 'lock'> = isRowLockSupported(manager) ?
                { lock: { mode: 'pessimistic_write' } } :
                {};

            const node = await manager.findOne(NodeEntity, {
                where: { id: nodeId },
                ...lock,
            });

            if (!node) {
                throw new EntityNotFoundError({ entity: 'node' });
            }

            // A plain read, not a locking one. It still sees what the previous
            // lock holder committed: InnoDB opens the REPEATABLE READ snapshot
            // at the first non-locking read, which is this one, after the node
            // lock; under Postgres READ COMMITTED every statement sees rows
            // committed before it starts. A locking read would take a gap lock
            // on UNIQUE(node_id, name) for a node without rows, and two such
            // nodes in one gap deadlock on their first inserts (MySQL).
            const stored = await manager.find(NodeComponentEntity, { where: { nodeId } });

            return fn(manager, node, stored);
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
