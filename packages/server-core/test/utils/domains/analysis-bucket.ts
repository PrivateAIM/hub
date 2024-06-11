/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from '@privateaim/core';
import type { TestAgent } from '../supertest';

export async function createSuperTestAnalysisBucket(superTest: TestAgent, entity: Partial<AnalysisBucket>) {
    return superTest
        .post('/analysis-buckets')
        .send(entity)
        .auth('admin', 'start123');
}
