/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node, NodeComponent } from '@privateaim/core-kit';
import {
    NODE_COMPONENT_NAME_PATTERN,
    NodeComponentReportValidator,
    NodeStatusReportValidator,
} from '@privateaim/core-kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext } from '@privateaim/server-kit';
import type { INodeComponentRepository } from '../../entities/node-component/types.ts';
import type { INodeRepository } from '../../entities/node/types.ts';
import type { INodeStatusService, NodeStatusServiceContext } from './types.ts';

export const NODE_OFFLINE_THRESHOLD_MS = 5 * 60 * 1000;

const NODE_COMPONENT_NAME_MAX_LENGTH = 64;

/**
 * The node half of a report, applied to the locked node row in the same
 * transaction as the component writes, so the stored deploymentVersion and
 * component set always come from the same report. Saves (returns true) only
 * when `online` or `deploymentVersion` changes: at most once per report.
 */
function touchNode(node: Node, deploymentVersion?: string): boolean {
    let changed = false;

    if (!node.online) {
        node.online = true;
        changed = true;
    }

    if (deploymentVersion !== undefined && node.deploymentVersion !== deploymentVersion) {
        node.deploymentVersion = deploymentVersion;
        changed = true;
    }

    return changed;
}

export class NodeStatusService implements INodeStatusService {
    protected nodeRepository: INodeRepository;

    protected nodeComponentRepository: INodeComponentRepository;

    protected startedAt: Date;

    constructor(ctx: NodeStatusServiceContext) {
        this.nodeRepository = ctx.nodeRepository;
        this.nodeComponentRepository = ctx.nodeComponentRepository;
        this.startedAt = ctx.startedAt ?? new Date();
    }

    async reportStatus(nodeId: string, data: unknown, actor: ActorContext): Promise<NodeComponent[]> {
        const report = await new NodeStatusReportValidator().run(data);
        const node = await this.getWritableNode(nodeId, actor);

        return this.nodeComponentRepository.replaceForNode(
            node.id,
            report.components.map((component) => ({ name: component.name, report: component })),
            new Date().toISOString(),
            {
                touch: (locked) => touchNode(locked, report.deployment?.version),
                ctx: { data: actor.metadata },
            },
        );
    }

    async reportComponentStatus(
        nodeId: string,
        name: string,
        data: unknown,
        actor: ActorContext,
    ): Promise<NodeComponent> {
        if (
            typeof name !== 'string' ||
            name.length > NODE_COMPONENT_NAME_MAX_LENGTH ||
            !NODE_COMPONENT_NAME_PATTERN.test(name)
        ) {
            throw new BadRequestError('The component name is invalid.');
        }

        const report = await new NodeComponentReportValidator().run(data);
        const node = await this.getWritableNode(nodeId, actor);

        return this.nodeComponentRepository.upsertForNode(
            node.id,
            { name, report },
            new Date().toISOString(),
            {
                touch: (locked) => touchNode(locked),
                ctx: { data: actor.metadata },
            },
        );
    }

    async markStaleNodesOffline(now: Date = new Date()): Promise<string[]> {
        // After a hub outage every node looks silent: hub downtime is not node downtime.
        if (now.getTime() - this.startedAt.getTime() < NODE_OFFLINE_THRESHOLD_MS) {
            return [];
        }

        const before = new Date(now.getTime() - NODE_OFFLINE_THRESHOLD_MS).toISOString();
        const ids = await this.nodeComponentRepository.findStaleOnlineNodeIds(before);

        const changed: string[] = [];

        for (const id of ids) {
            // The candidate list is unlocked: a report may complete before the
            // lock below is taken, so staleness is checked again under it.
            if (await this.nodeComponentRepository.markOfflineIfStale(id, before)) {
                changed.push(id);
            }
        }

        return changed;
    }

    /** Only the node's bound client may write; an unknown node is 404 before authorization. */
    protected async getWritableNode(nodeId: string, actor: ActorContext): Promise<Node> {
        const node = await this.nodeRepository.findOneById(nodeId);

        if (!node) {
            throw new EntityNotFoundError({ entity: 'node' });
        }

        if (
            !actor.identity ||
            actor.identity.type !== 'client' ||
            !node.clientId ||
            node.clientId !== actor.identity.id ||
            node.realmId !== actor.identity.realmId
        ) {
            throw new PermissionDeniedError('You are not permitted to report the status of this node.');
        }

        return node;
    }
}
