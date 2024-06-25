/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { Analysis } from '@privateaim/core-kit';
import type { TestAgent } from '../supertest';

export const TEST_DEFAULT_ANALYSIS : Partial<Analysis> = {
    name: faker.lorem.slug(),
};

export async function createSuperTestAnalysis(superTest: TestAgent, entity?: Partial<Analysis>) {
    return superTest
        .post('/analyses')
        .send({
            ...TEST_DEFAULT_ANALYSIS,
            ...(entity || {}),
        })
        .auth('admin', 'start123');
}
