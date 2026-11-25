/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeComponent } from '@privateaim/core-kit';
import type { ActorContext } from '@privateaim/server-kit';
import type { INodeComponentRepository } from '../../entities/node-component/types.ts';
import type { INodeRepository } from '../../entities/node/types.ts';

export interface INodeStatusService {
    reportStatus(nodeId: string, data: unknown, actor: ActorContext): Promise<NodeComponent[]>;
    reportComponentStatus(nodeId: string, name: string, data: unknown, actor: ActorContext): Promise<NodeComponent>;
    /** Clears `online` on nodes silent since `now - 5 min`. Returns the ids changed. */
    markStaleNodesOffline(now?: Date): Promise<string[]>;
}

export type NodeStatusServiceContext = {
    nodeRepository: INodeRepository;
    nodeComponentRepository: INodeComponentRepository;
};
