/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Event } from '@privateaim/telemetry-kit';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '../types.ts';

export interface IEventRepository extends IEntityRepository<Event> {

}

export interface IEventService {
    getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<Event>>;
    getOne(id: string, actor: ActorContext): Promise<Event>;
    create(data: Partial<Event>, actor: ActorContext): Promise<Event>;
    delete(id: string, actor: ActorContext): Promise<Event>;
}
