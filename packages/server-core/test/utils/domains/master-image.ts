/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { MasterImage } from '@privateaim/core-kit';
import type { TestAgent } from '../supertest';

export function createTestMasterImage() : Partial<MasterImage> {
    const name = faker.string.alpha({ length: 16, casing: 'lower' });

    return {
        group_virtual_path: name,
        name: 'base',
        path: `data\\${name}\\base`,
        virtual_path: `python/${name}`,
    };
}

export async function createSuperTestMasterImage(superTest: TestAgent, entity?: Partial<MasterImage>) {
    return superTest
        .post('/master-images')
        .send({
            ...createTestMasterImage(),
            ...(entity || {}),
        })
        .auth('admin', 'start123');
}
