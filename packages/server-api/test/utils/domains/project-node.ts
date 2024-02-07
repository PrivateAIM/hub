/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectNode } from '@privateaim/core';
import type { TestAgent } from '../supertest';

export async function createSuperTestProjectNode(superTest: TestAgent, proposalStation: Partial<ProjectNode>) {
    return superTest
        .post('/project-nodes')
        .send(proposalStation)
        .auth('admin', 'start123');
}
