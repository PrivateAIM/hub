/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { Node } from '@privateaim/core-kit';
import type { TestAgent } from '../supertest';

export const TEST_DEFAULT_NODE : Partial<Node> = {
    name: faker.lorem.slug(),
    external_name: faker.lorem.word(),
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
