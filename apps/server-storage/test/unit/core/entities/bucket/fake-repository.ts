/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Bucket } from '@privateaim/storage-kit';
import type { IBucketRepository } from '../../../../../src/core/entities/bucket/types.ts';
import { FakeEntityRepository } from '@privateaim/server-test-kit';

export class FakeBucketRepository extends FakeEntityRepository<Bucket> implements IBucketRepository {
    async findOneByIdOrName(id: string): Promise<Bucket | null> {
        const byId = await this.findOneById(id);
        if (byId) return byId;

        return this.findOneBy({ name: id });
    }
}
