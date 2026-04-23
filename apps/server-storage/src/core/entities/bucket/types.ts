/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Bucket } from '@privateaim/storage-kit';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';

export interface IBucketRepository extends IEntityRepository<Bucket> {
    findOneByIdOrName(id: string): Promise<Bucket | null>;
}

export interface IBucketCaller {
    create(data: Record<string, any>): Promise<Bucket>;
    delete(id: string): Promise<Bucket>;
}

export interface IBucketService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Bucket>>;
    getOne(id: string, query?: Record<string, any>): Promise<Bucket>;
    create(data: Partial<Bucket>, actor: ActorContext): Promise<Bucket>;
    update(id: string, data: Partial<Bucket>, actor: ActorContext): Promise<Bucket>;
    delete(id: string, actor: ActorContext): Promise<Bucket>;
}
