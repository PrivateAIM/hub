/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeComponent } from '@privateaim/core-kit';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import {
    AbstractEntityService,
    findManyScoped,
    scopeReadQuery,
} from '@privateaim/server-kit';
import { decodeQuery, preEvaluateRelationReads } from '../../query/index.ts';
import { NODE_READ_PERMISSIONS } from '../node/service.ts';
import { nodeComponentSchema } from './schema.ts';
import type {
    INodeComponentRepository,
    INodeComponentService,
    NodeComponentServiceContext,
} from './types.ts';

/** Relations an `include` can join, each guarded by its own read grant. */
const RELATION_READ_PERMISSIONS = { node: NODE_READ_PERMISSIONS } satisfies Partial<Record<keyof NodeComponent, string[]>>;

/**
 * Components are read like the nodes they belong to: a node read grant reads
 * every component, in every realm (nodes are a global catalog).
 */
export class NodeComponentService extends AbstractEntityService implements INodeComponentService {
    protected repository: INodeComponentRepository;

    constructor(ctx: NodeComponentServiceContext) {
        super();
        this.repository = ctx.repository;
    }

    async getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<NodeComponent>> {
        const decoded = decodeQuery(query, { schema: nodeComponentSchema });

        await preEvaluateRelationReads(decoded, actor, RELATION_READ_PERMISSIONS);

        const scoped = await scopeReadQuery(
            decoded,
            actor,
            {
                names: NODE_READ_PERMISSIONS,
                schema: nodeComponentSchema,
                compile: false,
            },
        );

        return findManyScoped(this.repository, scoped, actor);
    }
}
