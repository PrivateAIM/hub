/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNode } from '@privateaim/core-kit';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '../types.ts';

export interface IAnalysisNodeRepository extends IEntityRepository<AnalysisNode> {}

export interface IAnalysisNodeService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisNode>>;
    getOne(id: string): Promise<AnalysisNode>;
    create(data: Partial<AnalysisNode>, actor: ActorContext): Promise<AnalysisNode>;
    update(id: string, data: Partial<AnalysisNode>, actor: ActorContext): Promise<AnalysisNode>;
    delete(id: string, actor: ActorContext): Promise<AnalysisNode>;
}
