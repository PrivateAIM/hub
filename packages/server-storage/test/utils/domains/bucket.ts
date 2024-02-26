/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BucketEntity } from '../../../src/domains';
import type { TestAgent } from '../supertest';

export const TEST_BUCKET_DEFAULT : Partial<BucketEntity> = {
    name: 'development',
};

export async function createTestBucket(superTest: TestAgent, entity?: Partial<BucketEntity>) {
    return superTest
        .post('/buckets')
        .send({
            ...TEST_BUCKET_DEFAULT,
            ...(entity || {}),
        })
        .auth('admin', 'start123');
}
