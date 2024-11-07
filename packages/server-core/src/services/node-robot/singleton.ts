/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isAuthupClientUsable } from '@privateaim/server-kit';
import { singa } from 'singa';
import { NodeRobotService } from './module';

const instance = singa<NodeRobotService>({
    name: 'nodeRobot',
    factory: () => new NodeRobotService(),
});

export function isNodeRobotServiceUsable() {
    return isAuthupClientUsable();
}

export function useNodeRobotService(): NodeRobotService {
    return instance.use();
}
