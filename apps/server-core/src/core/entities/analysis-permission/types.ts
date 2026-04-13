/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisPermission } from '@privateaim/core-kit';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '../types.ts';

export interface IAnalysisPermissionRepository extends IEntityRepository<AnalysisPermission> {}

export interface IAnalysisPermissionService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<AnalysisPermission>>;
    getOne(id: string): Promise<AnalysisPermission>;
    create(data: Partial<AnalysisPermission>, actor: ActorContext): Promise<AnalysisPermission>;
    delete(id: string, actor: ActorContext): Promise<AnalysisPermission>;
}
