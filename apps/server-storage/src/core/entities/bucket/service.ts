/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Bucket } from '@privateaim/storage-kit';
import {
    BucketValidator,
    StorageCapabilityAction,
    assertBucketRefPairing,
    capabilityBucketIds,
} from '@privateaim/storage-kit';
import type { ICondition } from '@rapiq/core';
import { Query, eq, inArray } from '@rapiq/core';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import { PermissionName, ValidatorGroup } from '@privateaim/kit';
import { toBucketName } from '../../utils/bucket-name.ts';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService, appendQueryConditions } from '@privateaim/server-kit';
import { evaluateRecord, evaluateRecordUpdate } from '@authup/access';
import { decodeQuery } from '../../query/index.ts';
import type { IBucketDispatcher, IBucketRepository, IBucketService } from './types.ts';
import { bucketSchema } from './schema.ts';
import type { IStorageAdapter } from '../../storage/types.ts';
import { assertCapabilityCoversBucket } from '../../capability/module.ts';
import type { StorageRequester } from '../../capability/types.ts';
import { resolveBucketReadReach } from './reach.ts';

type BucketServiceContext = {
    repository: IBucketRepository;
    dispatcher: IBucketDispatcher;
    storage: IStorageAdapter;
};

export class BucketService extends AbstractEntityService implements IBucketService {
    protected repository: IBucketRepository;

    protected dispatcher: IBucketDispatcher;

    protected storage: IStorageAdapter;

    protected validator: BucketValidator;

    constructor(ctx: BucketServiceContext) {
        super();
        this.repository = ctx.repository;
        this.dispatcher = ctx.dispatcher;
        this.storage = ctx.storage;
        this.validator = new BucketValidator();
    }

    async getMany(
        query: Record<string, any>,
        requester: StorageRequester,
    ): Promise<EntityRepositoryFindManyResult<Bucket>> {
        const decoded = decodeQuery(query, { schema: bucketSchema });

        // ANDed onto the caller's filters, so no filter widens the result
        // beyond the covered or reached buckets.
        const condition = requester.type === 'capability' ?
            inArray('id', capabilityBucketIds(requester.capability.entries, StorageCapabilityAction.READ)) :
            await resolveBucketReadReach(requester.actor);

        return this.repository.findMany(condition ? appendQueryConditions(decoded, condition) : decoded);
    }

    async getOne(id: string, query: Record<string, any> | undefined, requester: StorageRequester): Promise<Bucket> {
        // Resolved by its stored id: `id` may be the bucket's name, and a
        // projection may lack `id`.
        const stored = await this.repository.findOneByIdOrName(id);

        if (!stored) {
            throw new EntityNotFoundError({ entity: 'bucket' });
        }

        let reach: ICondition | undefined;
        let target: ICondition = eq('id', stored.id);

        if (requester.type === 'capability') {
            assertCapabilityCoversBucket(requester.capability, stored.id, StorageCapabilityAction.READ);
        } else {
            // The list's condition: an unreached bucket is a 404, like a missing one.
            reach = await resolveBucketReadReach(requester.actor);

            // A name is unique per realm only: the unscoped lookup may have
            // picked another realm's bucket, so resolve it within the reach.
            if (stored.id !== id) {
                target = eq('name', id);
            }
        }

        if (!query && !reach) {
            return stored;
        }

        const decoded = query ?
            decodeQuery(query, { schema: bucketSchema, parameters: ['fields', 'relations'] }) :
            new Query({});

        const conditions: ICondition[] = [target];

        if (reach) {
            conditions.push(reach);
        }

        const { data } = await this.repository.findMany(appendQueryConditions(decoded, ...conditions));

        if (data.length === 0) {
            throw new EntityNotFoundError({ entity: 'bucket' });
        }

        return data[0];
    }

    async getUploadTarget(id: string, requester: StorageRequester): Promise<Bucket> {
        // Not read-scoped: uploading is judged by checkUploadAccess, which a
        // write-only capability or an uploader without read reach can pass.
        const entity = await this.repository.findOneByIdOrName(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'bucket' });
        }

        await this.checkUploadAccess(entity, requester);

        return entity;
    }

    async create(data: Partial<Bucket>, actor: ActorContext): Promise<Bucket> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.BUCKET_CREATE });

        if (!actor.identity) {
            throw new PermissionDeniedError('Only clients, users & robots are permitted to create a bucket.');
        }

        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        assertBucketRefPairing(validated);

        // a refId names another service's resource, which storage cannot check ownership of:
        // only the owning service sets it, over the bus. Otherwise a user could squat the
        // unique (refType, refId, name) of e.g. an analysis bucket, or be handed it back.
        if (validated.refId) {
            throw new BadRequestError('refId can only be set by the service owning the referenced resource.');
        }

        if (!validated.realmId) {
            validated.realmId = this.getActorRealmId(actor);
        }

        // A bucket's realm column is nullable: an actor without a realm creates a global row.
        await evaluateRecord(actor.permissionEvaluator, {
            name: PermissionName.BUCKET_CREATE,
            realm: validated.realmId ?? null,
            data: { attributes: validated },
        });

        return this.dispatcher.create({
            ...validated,
            actorId: actor.identity.id,
            actorType: actor.identity.type,
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
        }

        // Snapshot the stored row: typeorm's merge() writes into `entity`.
        const current = { realm: entity.realmId, data: { attributes: { ...entity } } };

        entity = this.repository.merge(entity, validated);

        // Attribute policies bind the target state as well as the stored one.
        if (!isOwner) {
            await evaluateRecordUpdate(actor.permissionEvaluator, {
                name: PermissionName.BUCKET_UPDATE,
                current,
                next: { realm: entity.realmId, data: { attributes: entity } },
            });
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
            await evaluateRecord(actor.permissionEvaluator, {
                name: PermissionName.BUCKET_DELETE,
                realm: entity.realmId,
                data: { attributes: entity },
            });
        }

        return this.dispatcher.delete(entity.id);
    }

    async clear(id: string, actor: ActorContext): Promise<Bucket> {
        const entity = await this.repository.findOneByIdOrName(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'bucket' });
        }

        if (!this.isOwnedByActor(entity, actor)) {
            await actor.permissionEvaluator.preEvaluate({ name: PermissionName.BUCKET_DELETE });
            await evaluateRecord(actor.permissionEvaluator, {
                name: PermissionName.BUCKET_DELETE,
                realm: entity.realmId,
                data: { attributes: entity },
            });
        }

        return this.dispatcher.clear(entity.id);
    }

    async checkUploadAccess(entity: Bucket, requester: StorageRequester): Promise<void> {
        if (requester.type === 'capability') {
            assertCapabilityCoversBucket(requester.capability, entity.id, StorageCapabilityAction.WRITE);

            return;
        }

        const { actor } = requester;

        if (this.isOwnedByActor(entity, actor)) {
            return;
        }

        await evaluateRecord(actor.permissionEvaluator, {
            name: PermissionName.BUCKET_UPDATE,
            realm: entity.realmId,
            data: { attributes: entity },
        });
    }

    private isOwnedByActor(entity: Bucket, actor: ActorContext): boolean {
        if (!actor.identity) {
            return false;
        }

        return entity.actorType === actor.identity.type &&
            entity.actorId === actor.identity.id;
    }
}
