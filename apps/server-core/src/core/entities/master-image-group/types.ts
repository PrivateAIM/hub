/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageGroup } from '@privateaim/core-kit';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';

export interface IMasterImageGroupRepository extends IEntityRepository<MasterImageGroup> {

}

export interface IMasterImageGroupService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<MasterImageGroup>>;
    getOne(id: string): Promise<MasterImageGroup>;
    delete(id: string, actor: ActorContext): Promise<MasterImageGroup>;
}
