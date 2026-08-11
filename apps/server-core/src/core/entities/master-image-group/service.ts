/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { eq } from '@rapiq/core';
import type { MasterImageGroup } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { EntityNotFoundError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
import { appendQueryConditions, decodeQuery } from '../../query/index.ts';
import { masterImageGroupSchema } from './schema.ts';
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
        return this.repository.findMany(decodeQuery(query, { schema: masterImageGroupSchema }));
    }

    /**
     * `findOneById` takes no query, so an actor-supplied `fields`/`relations`
     * selection has to go through `findMany` with an `id` condition appended.
     */
    async getOne(id: string, query?: Record<string, any>): Promise<MasterImageGroup> {
        const entity = query ?
            await this.repository.findMany(appendQueryConditions(decodeQuery(query, { schema: masterImageGroupSchema, parameters: ['fields', 'relations'] }), eq('id', id))).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'master-image-group' });
        }

        return entity;
    }

    async delete(id: string, actor: ActorContext): Promise<MasterImageGroup> {
        await actor.permissionChecker.preCheck({ name: PermissionName.MASTER_IMAGE_GROUP_MANAGE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'master-image-group' });
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }
}
