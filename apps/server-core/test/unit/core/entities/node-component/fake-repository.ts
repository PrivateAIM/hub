/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeComponent } from '@privateaim/core-kit';
import { EntityNotFoundError } from '@privateaim/errors';
import { FakeEntityRepository } from '@privateaim/server-test-kit';
import type {
    INodeComponentRepository,
    NodeComponentWrite,
} from '../../../../../src/core/entities/node-component/types.ts';
import { mergeNodeComponent } from '../../../../../src/core/services/node-status/merge.ts';
import type { FakeNodeRepository } from '../node/fake-repository.ts';

/**
 * In-memory adapter semantics without the lock: a single-threaded caller
 * never interleaves two writes. The node repository answers
 * `findStaleOnlineNodeIds`, which reads the node's `online` flag.
 */
export class FakeNodeComponentRepository extends FakeEntityRepository<NodeComponent> implements INodeComponentRepository {
    protected nodeRepository: FakeNodeRepository;

    constructor(nodeRepository: FakeNodeRepository) {
        super();

        this.nodeRepository = nodeRepository;
    }

    async replaceForNode(nodeId: string, writes: NodeComponentWrite[], reportedAt: string): Promise<NodeComponent[]> {
        await this.assertNode(nodeId);

        const named = new Set(writes.map((write) => write.name));
        const stored = await this.findManyBy({ nodeId });

        for (const row of stored) {
            if (!named.has(row.name)) {
                await this.remove(row);
            }
        }

        const output: NodeComponent[] = [];

        for (const write of writes) {
            output.push(await this.upsertForNode(nodeId, write, reportedAt));
        }

        return output;
    }

    async upsertForNode(nodeId: string, write: NodeComponentWrite, reportedAt: string): Promise<NodeComponent> {
        await this.assertNode(nodeId);

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

    protected async assertNode(nodeId: string): Promise<void> {
        if (!await this.nodeRepository.findOneById(nodeId)) {
            throw new EntityNotFoundError({ entity: 'node' });
        }
    }
}
