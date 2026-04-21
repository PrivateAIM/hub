/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Bucket } from '@privateaim/storage-kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@privateaim/kit';
import type { Client } from 'minio';
import { toBucketName } from '../../utils/bucket-name.ts';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult } from '../types.ts';
import { AbstractEntityService } from '../service.ts';
import { ValidatorGroup } from '../constants.ts';
import type { IBucketCaller, IBucketRepository, IBucketService } from './types.ts';
import { BucketValidator } from './validator.ts';

type BucketServiceContext = {
    repository: IBucketRepository;
    caller: IBucketCaller;
    minio: Client;
};

export class BucketService extends AbstractEntityService implements IBucketService {
    protected repository: IBucketRepository;

    protected caller: IBucketCaller;

    protected minio: Client;

    protected validator: BucketValidator;

    constructor(ctx: BucketServiceContext) {
        super();
        this.repository = ctx.repository;
        this.caller = ctx.caller;
        this.minio = ctx.minio;
        this.validator = new BucketValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Bucket>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string, query?: Record<string, any>): Promise<Bucket> {
        const entity = query ?
            await this.repository.findMany({ ...query, filter: { id } }).then((r) => r.data[0]) :
            await this.repository.findOneByIdOrName(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async create(data: Partial<Bucket>, actor: ActorContext): Promise<Bucket> {
        await actor.permissionChecker.preCheck({ name: PermissionName.BUCKET_CREATE });

        if (!actor.identity) {
            throw new ForbiddenError('Only clients, users & robots are permitted to create a bucket.');
        }

        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        if (validated.realm_id) {
            if (!isRealmResourceWritable(actor.realm, validated.realm_id)) {
                throw new ForbiddenError('You are not permitted to create this bucket.');
            }
        } else {
            validated.realm_id = this.getActorRealmId(actor);
        }

        return this.caller.create({
            actor_id: actor.identity.id,
            actor_type: actor.identity.type,
            ...validated,
        });
    }

    async update(id: string, data: Partial<Bucket>, actor: ActorContext): Promise<Bucket> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        let entity = await this.repository.findOneByIdOrName(id);
        if (!entity) {
            throw new NotFoundError();
        }

        if (!this.isOwnedByActor(entity, actor)) {
            await actor.permissionChecker.preCheck({ name: PermissionName.BUCKET_UPDATE });

            if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
                throw new ForbiddenError();
            }
        }

        entity = this.repository.merge(entity, validated);

        await this.repository.save(entity, { data: actor.metadata });

        const bucketName = toBucketName(entity.id);
        const hasBucket = await this.minio.bucketExists(bucketName);
        if (!hasBucket) {
            if (entity.region) {
                await this.minio.makeBucket(bucketName, entity.region);
            } else {
                await this.minio.makeBucket(bucketName);
            }
        }

        return entity;
    }

    async delete(id: string, actor: ActorContext): Promise<Bucket> {
        const entity = await this.repository.findOneByIdOrName(id);
        if (!entity) {
            throw new NotFoundError();
        }

        if (!this.isOwnedByActor(entity, actor)) {
            await actor.permissionChecker.preCheck({ name: PermissionName.BUCKET_DELETE });

            if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
                throw new ForbiddenError();
            }
        }

        return this.caller.delete(entity.id);
    }

    private isOwnedByActor(entity: Bucket, actor: ActorContext): boolean {
        if (!actor.identity) return false;
        return entity.actor_type === actor.identity.type &&
            entity.actor_id === actor.identity.id;
    }
}
