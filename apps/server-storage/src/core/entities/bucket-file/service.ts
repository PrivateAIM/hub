/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition } from '@rapiq/core';
import { eq, inArray, or } from '@rapiq/core';
import type { BucketFile } from '@privateaim/storage-kit';
import { StorageCapabilityAction, capabilityBucketFileIds, capabilityBucketIds } from '@privateaim/storage-kit';
import { EntityNotFoundError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService, appendQueryConditions } from '@privateaim/server-kit';
import { evaluateRecord } from '@authup/access';
import { decodeQuery } from '../../query/index.ts';
import type { IBucketFileDispatcher, IBucketFileRepository, IBucketFileService } from './types.ts';
import { bucketFileSchema } from './schema.ts';
import { assertCapabilityCoversBucketFile } from '../../capability/module.ts';
import type { StorageCapability, StorageRequester } from '../../capability/types.ts';

type BucketFileServiceContext = {
    repository: IBucketFileRepository;
    dispatcher: IBucketFileDispatcher;
};

export class BucketFileService extends AbstractEntityService implements IBucketFileService {
    protected repository: IBucketFileRepository;

    protected dispatcher: IBucketFileDispatcher;

    constructor(ctx: BucketFileServiceContext) {
        super();
        this.repository = ctx.repository;
        this.dispatcher = ctx.dispatcher;
    }

    async getMany(
        query: Record<string, any>,
        capability?: StorageCapability,
    ): Promise<EntityRepositoryFindManyResult<BucketFile>> {
        const decoded = decodeQuery(query, { schema: bucketFileSchema });

        if (!capability) {
            return this.repository.findMany(decoded);
        }

        const bucketIds = capabilityBucketIds(capability.entries, StorageCapabilityAction.READ);
        const fileIds = capabilityBucketFileIds(capability.entries, StorageCapabilityAction.READ);

        // ANDed onto the caller's filters, so no filter widens the result
        // beyond the covered buckets and files.
        let condition: ICondition = inArray('id', []);

        if (bucketIds.length > 0 && fileIds.length > 0) {
            condition = or(inArray('bucketId', bucketIds), inArray('id', fileIds));
        } else if (bucketIds.length > 0) {
            condition = inArray('bucketId', bucketIds);
        } else if (fileIds.length > 0) {
            condition = inArray('id', fileIds);
        }

        return this.repository.findMany(appendQueryConditions(decoded, condition));
    }

    async getOne(id: string, query?: Record<string, any>, capability?: StorageCapability): Promise<BucketFile> {
        const entity = query ?
            await this.repository.findMany(appendQueryConditions(decodeQuery(query, { schema: bucketFileSchema, parameters: ['fields', 'relations'] }), eq('id', id))).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'bucket-file' });
        }

        if (capability) {
            assertCapabilityCoversBucketFile(capability, entity, StorageCapabilityAction.READ);
        }

        return entity;
    }

    async delete(id: string, requester: StorageRequester): Promise<BucketFile> {
        const entity = await this.repository.findOneBy({ id });

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'bucket-file' });
        }

        let metadata: Record<string, any> | undefined;

        if (requester.type === 'capability') {
            // The entries decide alone: a capability has no identity to own
            // the file and no permission evaluator.
            const { capability } = requester;

            assertCapabilityCoversBucketFile(capability, entity, StorageCapabilityAction.DELETE);

            metadata = {
                actorId: capability.subject.id,
                actorType: capability.subject.type,
            };
        } else {
            await this.checkDeleteAccess(entity, requester.actor);

            metadata = requester.actor.metadata;
        }

        await this.dispatcher.delete(entity.id);

        const { id: entityId } = entity;

        await this.repository.remove(entity, { data: metadata });

        entity.id = entityId;

        return entity;
    }

    private async checkDeleteAccess(entity: BucketFile, actor: ActorContext): Promise<void> {
        if (this.isOwnedByActor(entity, actor) || this.isBucketOwnedByActor(entity, actor)) {
            return;
        }

        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.BUCKET_UPDATE });
        await evaluateRecord(actor.permissionEvaluator, {
            name: PermissionName.BUCKET_UPDATE,
            realm: entity.realmId,
            data: { attributes: entity },
        });
    }

    private isOwnedByActor(entity: BucketFile, actor: ActorContext): boolean {
        if (!actor.identity) {
            return false;
        }

        return entity.actorType === actor.identity.type &&
            entity.actorId === actor.identity.id;
    }

    private isBucketOwnedByActor(entity: BucketFile, actor: ActorContext): boolean {
        if (!actor.identity || !entity.bucket) {
            return false;
        }

        return entity.bucket.actorType === actor.identity.type &&
            entity.bucket.actorId === actor.identity.id;
    }
}
