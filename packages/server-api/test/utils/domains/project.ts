/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Project } from '@personalhealthtrain/core';
import type { SuperTest, Test } from 'supertest';

export const TEST_DEFAULT_PROJECT : Partial<Project> = {
    name: 'development',
};

export async function createSuperTestProject(superTest: SuperTest<Test>, proposal?: Partial<Project>) {
    return superTest
        .post('/projects')
        .send({
            ...TEST_DEFAULT_PROJECT,
            ...(proposal || {}),
        })
        .auth('admin', 'start123');
}
