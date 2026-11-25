/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Node,
    NodeComponent,
    NodeComponentReport,
} from '@privateaim/core-kit';
import type {
    ActorContext,
    EntityPersistContext,
    EntityRepositoryFindManyResult,
    IEntityRepository,
} from '@privateaim/server-kit';

export type NodeComponentWrite = { name: string; report: NodeComponentReport };

/**
 * Applied to the node row inside the write's transaction, after the
 * component writes and under the node lock: mutate the node and return true
 * to save it (through the subscribers), false to leave it untouched. It must
 * not await anything; a throw rolls the whole write back.
 */
export type NodeComponentWriteTouch = (node: Node) => boolean;

export type NodeComponentWriteOptions = {
    touch?: NodeComponentWriteTouch;
    ctx?: EntityPersistContext;
};

export interface INodeComponentRepository extends IEntityRepository<NodeComponent> {
    /**
     * In one transaction holding the node row lock: delete rows not in
     * `writes`, upsert the rest via mergeNodeComponent, then apply `touch`.
     * Throws EntityNotFoundError when the node does not exist.
     */
    replaceForNode(
        nodeId: string,
        writes: NodeComponentWrite[],
        reportedAt: string,
        options?: NodeComponentWriteOptions,
    ): Promise<NodeComponent[]>;
    /** As replaceForNode, for one row, without deleting any. */
    upsertForNode(
        nodeId: string,
        write: NodeComponentWrite,
        reportedAt: string,
        options?: NodeComponentWriteOptions,
    ): Promise<NodeComponent>;
    /** Ids of nodes with online = true whose newest component reportedAt < before, or that have no components. Unlocked candidates. */
    findStaleOnlineNodeIds(before: string): Promise<string[]>;
    /**
     * Under the node row lock the component writers take: clear `online`
     * only if the node is still online and its newest component reportedAt
     * is still < before (or it has none). Resolves whether it saved.
     */
    markOfflineIfStale(nodeId: string, before: string, ctx?: EntityPersistContext): Promise<boolean>;
}

export interface INodeComponentService {
    getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<NodeComponent>>;
}

export type NodeComponentServiceContext = {
    repository: INodeComponentRepository;
};
