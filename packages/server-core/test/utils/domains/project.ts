/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Project } from '@privateaim/core-kit';
import type { TestAgent } from '../supertest';

export const TEST_DEFAULT_PROJECT : Partial<Project> = {
    name: 'development',
};

export function createTestProject() : Partial<Project> {
    return {
        name: 'development',
    };
}

export async function createSuperTestProject(superTest: TestAgent, proposal?: Partial<Project>) {
    return superTest
        .post('/projects')
        .send({
            ...TEST_DEFAULT_PROJECT,
            ...(proposal || {}),
        })
        .auth('admin', 'start123');
}
