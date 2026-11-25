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
import { AbstractEntityService } from '@privateaim/server-kit';
import type { INodeComponentRepository } from '../../entities/node-component/types.ts';
import type { INodeRepository } from '../../entities/node/types.ts';
import type { INodeStatusService, NodeStatusServiceContext } from './types.ts';

export const NODE_OFFLINE_THRESHOLD_MS = 5 * 60 * 1000;

const NODE_COMPONENT_NAME_MAX_LENGTH = 64;

export class NodeStatusService extends AbstractEntityService implements INodeStatusService {
    protected nodeRepository: INodeRepository;

    protected nodeComponentRepository: INodeComponentRepository;

    constructor(ctx: NodeStatusServiceContext) {
        super();
        this.nodeRepository = ctx.nodeRepository;
        this.nodeComponentRepository = ctx.nodeComponentRepository;
    }

    async reportStatus(nodeId: string, data: unknown, actor: ActorContext): Promise<NodeComponent[]> {
        const report = await new NodeStatusReportValidator().run(data);
        const node = await this.getWritableNode(nodeId, actor);

        const components = await this.nodeComponentRepository.replaceForNode(
            node.id,
            report.components.map((component) => ({ name: component.name, report: component })),
            new Date().toISOString(),
        );

        await this.touchNode(node, report.deployment?.version);

        return components;
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

        const component = await this.nodeComponentRepository.upsertForNode(
            node.id,
            { name, report },
            new Date().toISOString(),
        );

        await this.touchNode(node);

        return component;
    }

    async markStaleNodesOffline(now: Date = new Date()): Promise<string[]> {
        const before = new Date(now.getTime() - NODE_OFFLINE_THRESHOLD_MS).toISOString();
        const ids = await this.nodeComponentRepository.findStaleOnlineNodeIds(before);

        const changed: string[] = [];

        for (const id of ids) {
            const node = await this.nodeRepository.findOneById(id);

            if (!node || !node.online) {
                continue;
            }

            node.online = false;
            await this.nodeRepository.save(node);
            changed.push(id);
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

    /** One save per report, and only when `online` or `deploymentVersion` changes. */
    protected async touchNode(node: Node, deploymentVersion?: string): Promise<void> {
        let changed = false;

        if (!node.online) {
            node.online = true;
            changed = true;
        }

        if (deploymentVersion !== undefined && node.deploymentVersion !== deploymentVersion) {
            node.deploymentVersion = deploymentVersion;
            changed = true;
        }

        if (changed) {
            await this.nodeRepository.save(node);
        }
    }
}
