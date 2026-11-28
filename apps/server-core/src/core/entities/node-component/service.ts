/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeComponent } from '@privateaim/core-kit';
import { PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import {
    AbstractEntityService,
    findManyScoped,
    scopeReadQuery,
} from '@privateaim/server-kit';
import { decodeQuery, preEvaluateRelationReads } from '../../query/index.ts';
import { NODE_READ_PERMISSIONS } from '../node/service.ts';
import { REGISTRY_READ_PERMISSIONS } from '../registry/service.ts';
import { REGISTRY_PROJECT_READ_PERMISSIONS } from '../registry-project/service.ts';
import { nodeComponentSchema } from './schema.ts';
import type {
    INodeComponentRepository,
    INodeComponentService,
    NodeComponentServiceContext,
} from './types.ts';

/**
 * Every relation path an `include` may join, each guarded by its own read grant,
 * nested paths included (`node.registry` reaches the registry through the node).
 * A path not listed here is refused, so a relation the node schema adds later
 * stays closed until it is mapped.
 */
const RELATION_READ_PERMISSIONS: Record<string, string[]> = {
    node: NODE_READ_PERMISSIONS,
    'node.registry': REGISTRY_READ_PERMISSIONS,
    'node.registryProject': REGISTRY_PROJECT_READ_PERMISSIONS,
};

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

        for (const relation of decoded.relations.value) {
            if (!Object.hasOwn(RELATION_READ_PERMISSIONS, relation.name)) {
                throw new PermissionDeniedError(`The relation ${relation.name} can not be included.`);
            }
        }

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
