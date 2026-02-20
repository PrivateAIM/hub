/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { Node } from '@privateaim/core-kit';
import type { TestAgent } from '../supertest';

export function createTestNode(entity: Partial<Node> = {}) : Partial<Node> {
    return {
        ...entity,
        name: faker.string.alpha({ length: 16, casing: 'lower' }),
        external_name: faker.string.alpha({ length: 16, casing: 'lower' }),
    };
}

export async function createSuperTestNode(superTest: TestAgent, entity: Partial<Node> = {}) {
    return superTest
        .post('/nodes')
        .send(createTestNode(entity))
        .auth('admin', 'start123');
}
