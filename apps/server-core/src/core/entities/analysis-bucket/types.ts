/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from '@privateaim/core-kit';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';

export interface IAnalysisBucketRepository extends IEntityRepository<AnalysisBucket> {}

export interface IAnalysisBucketService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisBucket>>;
    getOne(id: string): Promise<AnalysisBucket>;
    create(data: Partial<AnalysisBucket>, actor: ActorContext): Promise<AnalysisBucket>;
    update(id: string, data: Partial<AnalysisBucket>, actor: ActorContext): Promise<AnalysisBucket>;
    delete(id: string, actor: ActorContext): Promise<AnalysisBucket>;
}
