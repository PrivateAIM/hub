/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { Project } from '@privateaim/core-kit';
import type { TestAgent } from '../supertest';

export function createTestProject(input: Partial<Project> = {}) : Partial<Project> {
    return {
        name: faker.string.alpha({ length: 16, casing: 'lower' }),
        ...input,
    };
}

export async function createSuperTestProject(superTest: TestAgent, input: Partial<Project> = {}) {
    return superTest
        .post('/projects')
        .send(createTestProject(input))
        .auth('admin', 'start123');
}
