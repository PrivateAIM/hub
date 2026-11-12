/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Bucket } from '@privateaim/storage-kit';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';
import type { StorageRequester } from '../../capability/types.ts';

export interface IBucketRepository extends IEntityRepository<Bucket> {
    findOneByIdOrName(id: string): Promise<Bucket | null>;
}

export interface IBucketDispatcher {
    create(data: Record<string, any>): Promise<Bucket>;
    delete(id: string): Promise<Bucket>;
    clear(id: string): Promise<Bucket>;
}

export interface IBucketService {
    /**
     * The buckets a capability covers for read, or an identity reaches
     * (`BUCKET_READ_PERMISSIONS` through the bucket's realm, or ownership).
     */
    getMany(query: Record<string, any>, requester: StorageRequester): Promise<EntityRepositoryFindManyResult<Bucket>>;
    /**
     * One bucket by id or name, through the list's condition: an identity
     * that does not reach it gets a 404, an uncovering capability a 403.
     */
    getOne(id: string, query: Record<string, any> | undefined, requester: StorageRequester): Promise<Bucket>;
    /**
     * The bucket an upload targets, after checkUploadAccess; not read-scoped.
     */
    getUploadTarget(id: string, requester: StorageRequester): Promise<Bucket>;
    create(data: Partial<Bucket>, actor: ActorContext): Promise<Bucket>;
    update(id: string, data: Partial<Bucket>, actor: ActorContext): Promise<Bucket>;
    delete(id: string, actor: ActorContext): Promise<Bucket>;
    clear(id: string, actor: ActorContext): Promise<Bucket>;
    checkUploadAccess(entity: Bucket, requester: StorageRequester): Promise<void>;
}
