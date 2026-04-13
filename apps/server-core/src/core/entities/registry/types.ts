/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry } from '@privateaim/core-kit';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '../types.ts';

export interface IRegistryRepository extends IEntityRepository<Registry> {
    findOneWithSecret(id: string): Promise<Registry | null>;
}

export interface IRegistryService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Registry>>;
    getOne(id: string, query?: Record<string, any>): Promise<Registry>;
    create(data: Partial<Registry>, actor: ActorContext): Promise<Registry>;
    update(id: string, data: Partial<Registry>, actor: ActorContext): Promise<Registry>;
    delete(id: string, actor: ActorContext): Promise<Registry>;
}
