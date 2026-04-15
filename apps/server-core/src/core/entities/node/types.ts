/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node, RegistryProject } from '@privateaim/core-kit';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '../types.ts';

export interface INodeRepository extends IEntityRepository<Node> {
    findOneWithExternalName(id: string): Promise<Node | null>;
}

export interface IRegistryManager {
    findDefaultRegistryId(): Promise<string | null>;

    createProject(data: Partial<RegistryProject>): Promise<RegistryProject>;
    findProject(id: string): Promise<RegistryProject | null>;
    saveProject(project: RegistryProject): Promise<RegistryProject>;
    removeProject(project: RegistryProject): Promise<void>;

    linkProject(id: string): Promise<void>;
    relinkProject(project: RegistryProject): Promise<void>;
    unlinkProject(project: RegistryProject): Promise<void>;
}

export interface INodeService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Node>>;
    getOne(id: string, query?: Record<string, any>): Promise<Node>;
    create(data: Partial<Node>, actor: ActorContext): Promise<Node>;
    update(id: string, data: Partial<Node>, actor: ActorContext): Promise<Node>;
    delete(id: string, actor: ActorContext): Promise<Node>;
}
