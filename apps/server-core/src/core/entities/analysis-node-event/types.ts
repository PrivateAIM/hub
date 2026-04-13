/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNodeEvent } from '@privateaim/core-kit';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '../types.ts';

export interface IAnalysisNodeEventRepository extends IEntityRepository<AnalysisNodeEvent> {}

export interface IAnalysisNodeEventService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisNodeEvent>>;
    getOne(id: string): Promise<AnalysisNodeEvent>;
}
