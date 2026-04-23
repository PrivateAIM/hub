/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BucketFile } from '@privateaim/storage-kit';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';

export interface IBucketFileRepository extends IEntityRepository<BucketFile> {

}

export interface IBucketFileCaller {
    delete(id: string): Promise<void>;
}

export interface IBucketFileService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<BucketFile>>;
    getOne(id: string, query?: Record<string, any>): Promise<BucketFile>;
    delete(id: string, actor: ActorContext): Promise<BucketFile>;
}
