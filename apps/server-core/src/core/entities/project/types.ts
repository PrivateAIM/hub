/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Project } from '@privateaim/core-kit';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';

export interface IProjectRepository extends IEntityRepository<Project> {
    checkUniqueness(data: Partial<Project>, existing?: Project): Promise<void>;
}

export interface IProjectService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Project>>;
    getOne(id: string, query?: Record<string, any>): Promise<Project>;
    create(data: Partial<Project>, actor: ActorContext): Promise<Project>;
    update(id: string, data: Partial<Project>, actor: ActorContext): Promise<Project>;
    delete(id: string, actor: ActorContext): Promise<Project>;
}
