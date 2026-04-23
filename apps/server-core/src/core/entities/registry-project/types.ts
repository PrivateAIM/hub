/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from '@privateaim/core-kit';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';

export interface IRegistryProjectRepository extends IEntityRepository<RegistryProject> {}

export interface IRegistryProjectService {
    getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<RegistryProject>>;
    getOne(id: string, actor: ActorContext, query?: Record<string, any>): Promise<RegistryProject>;
    create(data: Partial<RegistryProject>, actor: ActorContext): Promise<RegistryProject>;
    update(id: string, data: Partial<RegistryProject>, actor: ActorContext): Promise<RegistryProject>;
    delete(id: string, actor: ActorContext): Promise<RegistryProject>;
}
