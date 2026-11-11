/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BucketFile } from '@privateaim/storage-kit';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';
import type { StorageRequester } from '../../capability/types.ts';

export interface IBucketFileRepository extends IEntityRepository<BucketFile> {

}

export interface IBucketFileDispatcher {
    delete(id: string): Promise<void>;
}

export interface IBucketFileService {
    /**
     * The files a capability covers for read, or of the buckets an identity
     * reaches (judged by the bucket, never by the file's own realm).
     */
    getMany(query: Record<string, any>, requester: StorageRequester): Promise<EntityRepositoryFindManyResult<BucketFile>>;
    /**
     * One file through the list's condition: an identity that does not reach
     * its bucket gets a 404, an uncovering capability a 403.
     */
    getOne(id: string, query: Record<string, any> | undefined, requester: StorageRequester): Promise<BucketFile>;
    delete(id: string, requester: StorageRequester): Promise<BucketFile>;
}
