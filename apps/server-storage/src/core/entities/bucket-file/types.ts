/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BucketFile } from '@privateaim/storage-kit';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';
import type { StorageCapability, StorageRequester } from '../../capability/types.ts';

export interface IBucketFileRepository extends IEntityRepository<BucketFile> {

}

export interface IBucketFileDispatcher {
    delete(id: string): Promise<void>;
}

export interface IBucketFileService {
    getMany(query: Record<string, any>, capability?: StorageCapability): Promise<EntityRepositoryFindManyResult<BucketFile>>;
    getOne(id: string, query?: Record<string, any>, capability?: StorageCapability): Promise<BucketFile>;
    delete(id: string, requester: StorageRequester): Promise<BucketFile>;
}
