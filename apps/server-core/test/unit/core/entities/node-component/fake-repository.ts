/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node, NodeComponent } from '@privateaim/core-kit';
import { EntityNotFoundError } from '@privateaim/errors';
import { FakeEntityRepository } from '@privateaim/server-test-kit';
import type { EntityPersistContext } from '@privateaim/server-kit';
import type {
    INodeComponentRepository,
    NodeComponentWrite,
    NodeComponentWriteOptions,
} from '../../../../../src/core/entities/node-component/types.ts';
import { mergeNodeComponent } from '../../../../../src/core/services/node-status/merge.ts';
import type { FakeNodeRepository } from '../node/fake-repository.ts';

/**
 * In-memory adapter semantics. A per-node lock stands in for the node row
 * lock: every write and the offline sweep for one node run one at a time,
 * each with its node update, as the adapter's transaction does. The node
 * repository answers the node reads and saves.
 */
export class FakeNodeComponentRepository extends FakeEntityRepository<NodeComponent> implements INodeComponentRepository {
    protected nodeRepository: FakeNodeRepository;

    protected locks = new Map<string, Promise<void>>();

    constructor(nodeRepository: FakeNodeRepository) {
        super();

        this.nodeRepository = nodeRepository;
    }

    /**
     * Runs before the node lock is taken: stands in for another writer (an
     * admin edit or delete, a report) committing between the service's early
     * read (node load, stale candidate query) and the lock.
     */
    beforeLock: ((nodeId: string) => Promise<void>) | undefined;

    /**
     * Runs inside the lock, after the component writes and before the node
     * update. Must not wait for another write to the same node: that one is
     * blocked on this lock.
     */
    insideLock: ((nodeId: string) => Promise<void>) | undefined;

    /** Runs once the write committed and released the lock, before it resolves. */
    afterWrite: ((nodeId: string) => Promise<void>) | undefined;

    async replaceForNode(
        nodeId: string,
        writes: NodeComponentWrite[],
        reportedAt: string,
        options: NodeComponentWriteOptions = {},
    ): Promise<NodeComponent[]> {
        const output = await this.withNodeLock(nodeId, async (node) => {
            const named = new Set(writes.map((write) => write.name));
            const stored = await this.findManyBy({ nodeId });

            for (const row of stored) {
                if (!named.has(row.name)) {
                    await this.remove(row);
                }
            }

            const rows: NodeComponent[] = [];

            for (const write of writes) {
                rows.push(await this.upsertOne(nodeId, write, reportedAt));
            }

            await this.touch(nodeId, node, options);

            return rows;
        });

        await this.afterWrite?.(nodeId);

        return output;
    }

    async upsertForNode(
        nodeId: string,
        write: NodeComponentWrite,
        reportedAt: string,
        options: NodeComponentWriteOptions = {},
    ): Promise<NodeComponent> {
        const output = await this.withNodeLock(nodeId, async (node) => {
            const row = await this.upsertOne(nodeId, write, reportedAt);

            await this.touch(nodeId, node, options);

            return row;
        });

        await this.afterWrite?.(nodeId);

        return output;
    }

    async markOfflineIfStale(nodeId: string, before: string, ctx?: EntityPersistContext): Promise<boolean> {
        try {
            return await this.withNodeLock(nodeId, async (node) => {
                if (!node.online) {
                    return false;
                }

                const threshold = new Date(before).getTime();
                const fresh = this.getAll()
                    .some((row) => row.nodeId === nodeId && new Date(row.reportedAt).getTime() >= threshold);

                if (fresh) {
                    return false;
                }

                await this.nodeRepository.save({ ...node, online: false }, ctx);

                return true;
            });
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                return false;
            }

            throw e;
        }
    }

    async findStaleOnlineNodeIds(before: string): Promise<string[]> {
        const threshold = new Date(before).getTime();
        const nodes = await this.nodeRepository.findManyBy({ online: true });
        const components = this.getAll();

        return nodes
            .filter((node) => components
                .filter((component) => component.nodeId === node.id)
                .every((component) => new Date(component.reportedAt).getTime() < threshold))
            .map((node) => node.id);
    }

    protected async upsertOne(nodeId: string, write: NodeComponentWrite, reportedAt: string): Promise<NodeComponent> {
        const current = await this.findOneBy({ nodeId, name: write.name });
        const data = mergeNodeComponent(current ?? undefined, write.report, reportedAt);

        const entity = current ?
            this.merge(current, data) :
            this.create({
                ...data,
                nodeId,
                name: write.name,
            });

        return this.save(entity);
    }

    /** `touch` works on a copy of the locked row; only a true result saves it. */
    protected async touch(nodeId: string, node: Node, options: NodeComponentWriteOptions): Promise<void> {
        await this.insideLock?.(nodeId);

        if (!options.touch) {
            return;
        }

        const entity = { ...node };

        if (options.touch(entity)) {
            await this.nodeRepository.save(entity, options.ctx);
        }
    }

    /**
     * Wait for the node's previous holder, then run `fn` with the node row as
     * it is now. Throws EntityNotFoundError when the node does not exist.
     */
    protected async withNodeLock<T>(nodeId: string, fn: (node: Node) => Promise<T>): Promise<T> {
        await this.beforeLock?.(nodeId);

        const previous = this.locks.get(nodeId) ?? Promise.resolve();
        const { promise: current, resolve: release } = Promise.withResolvers<void>();
        const tail = previous.then(() => current);

        this.locks.set(nodeId, tail);

        await previous;

        try {
            const node = await this.nodeRepository.findOneById(nodeId);

            if (!node) {
                throw new EntityNotFoundError({ entity: 'node' });
            }

            return await fn(node);
        } finally {
            release();

            if (this.locks.get(nodeId) === tail) {
                this.locks.delete(nodeId);
            }
        }
    }
}
