/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageGroup } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { NotFoundError } from '@ebec/http';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult } from '../types.ts';
import { AbstractEntityService } from '../service.ts';
import type { IMasterImageGroupRepository, IMasterImageGroupService } from './types.ts';

type MasterImageGroupServiceContext = {
    repository: IMasterImageGroupRepository;
};

export class MasterImageGroupService extends AbstractEntityService implements IMasterImageGroupService {
    protected repository: IMasterImageGroupRepository;

    constructor(ctx: MasterImageGroupServiceContext) {
        super();
        this.repository = ctx.repository;
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<MasterImageGroup>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string): Promise<MasterImageGroup> {
        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async delete(id: string, actor: ActorContext): Promise<MasterImageGroup> {
        await actor.permissionChecker.preCheck({ name: PermissionName.MASTER_IMAGE_GROUP_MANAGE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        await this.repository.remove(entity, { data: actor.metadata });

        return entity;
    }
}
