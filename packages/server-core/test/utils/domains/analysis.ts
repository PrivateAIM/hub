/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { Analysis } from '@privateaim/core-kit';
import type { TestAgent } from '../supertest';

export function createTestAnalysis(entity: Partial<Analysis> = {}) : Partial<Analysis> {
    return {
        name: faker.string.alpha({ length: 16, casing: 'lower' }),
        ...entity,
    };
}

export async function createSuperTestAnalysis(superTest: TestAgent, entity: Partial<Analysis> = {}) {
    return superTest
        .post('/analyses')
        .send(createTestAnalysis(entity))
        .auth('admin', 'start123');
}
