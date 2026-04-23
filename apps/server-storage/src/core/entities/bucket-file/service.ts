/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BucketFile } from '@privateaim/storage-kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
import type { IBucketFileCaller, IBucketFileRepository, IBucketFileService } from './types.ts';

type BucketFileServiceContext = {
    repository: IBucketFileRepository;
    caller: IBucketFileCaller;
};

export class BucketFileService extends AbstractEntityService implements IBucketFileService {
    protected repository: IBucketFileRepository;

    protected caller: IBucketFileCaller;

    constructor(ctx: BucketFileServiceContext) {
        super();
        this.repository = ctx.repository;
        this.caller = ctx.caller;
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<BucketFile>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string, query?: Record<string, any>): Promise<BucketFile> {
        const entity = query ?
            await this.repository.findMany({ ...query, filter: { id } }).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async delete(id: string, actor: ActorContext): Promise<BucketFile> {
        const entity = await this.repository.findOneBy({ id });

        if (!entity) {
            throw new NotFoundError();
        }

        if (
            !this.isOwnedByActor(entity, actor) &&
            !this.isBucketOwnedByActor(entity, actor)
        ) {
            await actor.permissionChecker.preCheck({ name: PermissionName.BUCKET_UPDATE });

            if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
                throw new ForbiddenError();
            }
        }

        await this.caller.delete(entity.id);

        const { id: entityId } = entity;

        await this.repository.remove(entity);

        entity.id = entityId;

        return entity;
    }

    private isOwnedByActor(entity: BucketFile, actor: ActorContext): boolean {
        if (!actor.identity) return false;
        return entity.actor_type === actor.identity.type &&
            entity.actor_id === actor.identity.id;
    }

    private isBucketOwnedByActor(entity: BucketFile, actor: ActorContext): boolean {
        if (!actor.identity || !entity.bucket) return false;
        return entity.bucket.actor_type === actor.identity.type &&
            entity.bucket.actor_id === actor.identity.id;
    }
}
