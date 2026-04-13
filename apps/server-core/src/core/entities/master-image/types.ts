/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage } from '@privateaim/core-kit';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '../types.ts';

export interface IMasterImageRepository extends IEntityRepository<MasterImage> {

}

export interface IMasterImageService {
    getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<MasterImage>>;
    getOne(id: string): Promise<MasterImage>;
    delete(id: string, actor: ActorContext): Promise<MasterImage>;
}
