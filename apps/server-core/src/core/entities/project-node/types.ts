/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectNode } from '@privateaim/core-kit';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '../types.ts';

export interface IProjectNodeRepository extends IEntityRepository<ProjectNode> {}

export interface IProjectNodeService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<ProjectNode>>;
    getOne(id: string): Promise<ProjectNode>;
    create(data: Partial<ProjectNode>, actor: ActorContext): Promise<ProjectNode>;
    update(id: string, data: Partial<ProjectNode>, actor: ActorContext): Promise<ProjectNode>;
    delete(id: string, actor: ActorContext): Promise<ProjectNode>;
}
