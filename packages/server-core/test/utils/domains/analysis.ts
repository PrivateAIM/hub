/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { Analysis } from '@privateaim/core-kit';

export function createTestAnalysis(entity: Partial<Analysis> = {}) : Partial<Analysis> {
    return {
        name: faker.string.alpha({ length: 16, casing: 'lower' }),
        ...entity,
    };
}
