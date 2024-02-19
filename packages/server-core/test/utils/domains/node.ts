/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '@privateaim/core';
import type { TestAgent } from '../supertest';

export const TEST_DEFAULT_NODE : Partial<Node> = {
    name: 'foo-bar-baz',
    external_name: 'test',
};

export async function createSuperTestNode(superTest: TestAgent, entity?: Partial<Node>) {
    return superTest
        .post('/nodes')
        .send({
            ...TEST_DEFAULT_NODE,
            ...(entity || {}),
        })
        .auth('admin', 'start123');
}
