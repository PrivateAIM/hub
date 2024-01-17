/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '@personalhealthtrain/core';
import type { SuperTest, Test } from 'supertest';

export const TEST_DEFAULT_STATION : Partial<Node> = {
    name: 'foo-bar-baz',
    external_name: 'test',
};

export async function createSuperTestStation(superTest: SuperTest<Test>, entity?: Partial<Node>) {
    return superTest
        .post('/stations')
        .send({
            ...TEST_DEFAULT_STATION,
            ...(entity || {}),
        })
        .auth('admin', 'start123');
}
