/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeComponent, NodeComponentProbeReport, NodeComponentReport } from '@privateaim/core-kit';
import type {
    ActorContext,
    EntityRepositoryFindManyResult,
    IEntityRepository,
} from '@privateaim/server-kit';

export type NodeComponentWrite = { name: string; report: NodeComponentReport | NodeComponentProbeReport };

export interface INodeComponentRepository extends IEntityRepository<NodeComponent> {
    /** Lock the node row, delete rows not in `writes`, upsert the rest via mergeNodeComponent. */
    replaceForNode(nodeId: string, writes: NodeComponentWrite[], reportedAt: string): Promise<NodeComponent[]>;
    /** Lock the node row, upsert one row via mergeNodeComponent. */
    upsertForNode(nodeId: string, write: NodeComponentWrite, reportedAt: string): Promise<NodeComponent>;
    /** Ids of nodes with online = true whose newest component reportedAt < before, or that have no components. */
    findStaleOnlineNodeIds(before: string): Promise<string[]>;
}

export interface INodeComponentService {
    getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<NodeComponent>>;
}

export type NodeComponentServiceContext = {
    repository: INodeComponentRepository;
};
