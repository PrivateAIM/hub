/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { NotFoundError } from '@ebec/http';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult } from '../types.ts';
import { AbstractEntityService } from '../service.ts';
import type { IMasterImageRepository, IMasterImageService } from './types.ts';

type MasterImageServiceContext = {
    repository: IMasterImageRepository;
};

export class MasterImageService extends AbstractEntityService implements IMasterImageService {
    protected repository: IMasterImageRepository;

    constructor(ctx: MasterImageServiceContext) {
        super();
        this.repository = ctx.repository;
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<MasterImage>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string): Promise<MasterImage> {
        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async delete(id: string, actor: ActorContext): Promise<MasterImage> {
        await actor.permissionChecker.preCheck({ name: PermissionName.MASTER_IMAGE_MANAGE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }
}
