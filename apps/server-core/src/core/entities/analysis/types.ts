/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '../types.ts';

export interface IAnalysisRepository extends IEntityRepository<Analysis> {
    findOneWithProject(id: string): Promise<Analysis | null>;
}

export interface IAnalysisService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Analysis>>;
    getOne(id: string): Promise<Analysis>;
    create(data: Partial<Analysis>, actor: ActorContext): Promise<Analysis>;
    update(id: string, data: Partial<Analysis>, actor: ActorContext): Promise<Analysis>;
    delete(id: string, actor: ActorContext): Promise<Analysis>;
}
