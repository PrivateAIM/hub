/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NodeComponent } from '@privateaim/core-kit';
import type { INodeStatusService } from '../../../../../src/core/services/node-status/index.ts';

export class IdleNodeStatusService implements INodeStatusService {
    async reportStatus(): Promise<NodeComponent[]> {
        return [];
    }

    async reportComponentStatus(): Promise<NodeComponent> {
        throw new Error('not used');
    }

    async markStaleNodesOffline(): Promise<string[]> {
        return [];
    }
}
