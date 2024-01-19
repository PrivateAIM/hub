/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@personalhealthtrain/core';
import type { SuperTest, Test } from 'supertest';

export const TEST_DEFAULT_ANALYSIS : Partial<Analysis> = {
    name: 'development'
};

export async function createSuperTestTrain(superTest: SuperTest<Test>, entity?: Partial<Analysis>) {
    return superTest
        .post('/analyses')
        .send({
            ...TEST_DEFAULT_ANALYSIS,
            ...(entity || {}),
        })
        .auth('admin', 'start123');
}
