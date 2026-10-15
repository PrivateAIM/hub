/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Bucket } from '@privateaim/storage-kit';
import { eq } from '@rapiq/core';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import { PermissionName, ValidatorGroup } from '@privateaim/kit';
import { toBucketName } from '../../utils/bucket-name.ts';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService, appendQueryConditions, assertRecordReach  } from '@privateaim/server-kit';
import { decodeQuery } from '../../query/index.ts';
import type { IBucketCaller, IBucketRepository, IBucketService } from './types.ts';
import { BucketValidator, assertBucketRefPairing } from '@privateaim/storage-kit';
import { bucketSchema } from './schema.ts';
import type { IStorageAdapter } from '../../storage/types.ts';

type BucketServiceContext = {
    repository: IBucketRepository;
    caller: IBucketCaller;
    storage: IStorageAdapter;
};

export class BucketService extends AbstractEntityService implements IBucketService {
    protected repository: IBucketRepository;

    protected caller: IBucketCaller;

    protected storage: IStorageAdapter;

    protected validator: BucketValidator;

    constructor(ctx: BucketServiceContext) {
        super();
        this.repository = ctx.repository;
        this.caller = ctx.caller;
        this.storage = ctx.storage;
        this.validator = new BucketValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Bucket>> {
        return this.repository.findMany(decodeQuery(query, { schema: bucketSchema }));
    }

    async getOne(id: string, query?: Record<string, any>): Promise<Bucket> {
        const entity = query ?
            await this.repository.findMany(appendQueryConditions(decodeQuery(query, { schema: bucketSchema, parameters: ['fields', 'relations'] }), eq('id', id))).then((r) => r.data[0]) :
            await this.repository.findOneByIdOrName(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'bucket' });
        }

        return entity;
    }

    async create(data: Partial<Bucket>, actor: ActorContext): Promise<Bucket> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.BUCKET_CREATE });

        if (!actor.identity) {
            throw new PermissionDeniedError('Only clients, users & robots are permitted to create a bucket.');
        }

        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });
        assertBucketRefPairing(validated);

        if (!validated.realmId) {
            validated.realmId = this.getActorRealmId(actor);
        }

        await assertRecordReach(actor, PermissionName.BUCKET_CREATE, { realmId: validated.realmId, attributes: validated });

        return this.caller.create({
            actorId: actor.identity.id,
            actorType: actor.identity.type,
            ...validated,
        });
    }

    async update(id: string, data: Partial<Bucket>, actor: ActorContext): Promise<Bucket> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        let entity = await this.repository.findOneByIdOrName(id);
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'bucket' });
        }

        const isOwner = this.isOwnedByActor(entity, actor);
        if (!isOwner) {
            await actor.permissionEvaluator.preEvaluate({ name: PermissionName.BUCKET_UPDATE });
            await assertRecordReach(actor, PermissionName.BUCKET_UPDATE, { realmId: entity.realmId, attributes: entity });
        }

        entity = this.repository.merge(entity, validated);

        // Attribute policies bind the target state as well as the stored one.
        if (!isOwner) {
            await assertRecordReach(actor, PermissionName.BUCKET_UPDATE, { realmId: entity.realmId, attributes: entity });
        }

        await this.repository.save(entity, { data: actor.metadata });

        const bucketName = toBucketName(entity.id);
        const hasBucket = await this.storage.bucketExists(bucketName);
        if (!hasBucket) {
            if (entity.region) {
                await this.storage.makeBucket(bucketName, entity.region);
            } else {
                await this.storage.makeBucket(bucketName);
            }
        }

        return entity;
    }

    async delete(id: string, actor: ActorContext): Promise<Bucket> {
        const entity = await this.repository.findOneByIdOrName(id);
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'bucket' });
        }

        if (!this.isOwnedByActor(entity, actor)) {
            await actor.permissionEvaluator.preEvaluate({ name: PermissionName.BUCKET_DELETE });
            await assertRecordReach(actor, PermissionName.BUCKET_DELETE, { realmId: entity.realmId, attributes: entity });
        }

        return this.caller.delete(entity.id);
    }

    async clear(id: string, actor: ActorContext): Promise<Bucket> {
        const entity = await this.repository.findOneByIdOrName(id);
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'bucket' });
        }

        if (!this.isOwnedByActor(entity, actor)) {
            await actor.permissionEvaluator.preEvaluate({ name: PermissionName.BUCKET_DELETE });
            await assertRecordReach(actor, PermissionName.BUCKET_DELETE, { realmId: entity.realmId, attributes: entity });
        }

        return this.caller.clear(entity.id);
    }

    private isOwnedByActor(entity: Bucket, actor: ActorContext): boolean {
        if (!actor.identity) return false;
        return entity.actorType === actor.identity.type &&
            entity.actorId === actor.identity.id;
    }
}
