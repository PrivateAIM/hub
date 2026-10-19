/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Bucket } from '@privateaim/storage-kit';
import { BuiltInPolicyType, PermissionError } from '@authup/access';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { BucketService } from '../../../../../src/core/entities/bucket/service.ts';
import {
    createAllowAllActor,
    createDenyAllActor,
    createScopedActor,
} from '@privateaim/server-test-kit';
import { FakeBucketDispatcher } from './fake-dispatcher.ts';
import { FakeBucketRepository } from './fake-repository.ts';
import { FakeStorageAdapter } from './fake-storage.ts';

function createTestBucket(overrides?: Partial<Bucket>): Bucket {
    return {
        id: randomUUID(),
        name: 'test-bucket',
        region: null,
        actorId: null,
        actorType: null,
        realmId: 'realm-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as Bucket;
}

describe('BucketService', () => {
    let repository: FakeBucketRepository;
    let dispatcher: FakeBucketDispatcher;
    let storage: FakeStorageAdapter;
    let service: BucketService;

    beforeEach(() => {
        repository = new FakeBucketRepository();
        dispatcher = new FakeBucketDispatcher();
        storage = new FakeStorageAdapter();
        service = new BucketService({
            repository,
            dispatcher,
            storage,
        });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestBucket({ id: 'b-1' }),
                createTestBucket({ id: 'b-2' }),
            ]);

            const result = await service.getMany({});
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const bucket = createTestBucket({ id: 'b-1' });
            repository.seed(bucket);

            const result = await service.getOne('b-1');
            expect(result.id).toBe('b-1');
        });

        it('should return entity by name', async () => {
            const bucket = createTestBucket({ name: 'my-bucket' });
            repository.seed(bucket);

            const result = await service.getOne('my-bucket');
            expect(result.name).toBe('my-bucket');
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('create', () => {
        it('should delegate to dispatcher with actor info', async () => {
            const actor = createAllowAllActor('realm-1');

            const result = await service.create(
                { name: 'new-bucket' },
                actor,
            );

            expect(result).toBeDefined();
            expect(dispatcher.getCreateCalls()).toHaveLength(1);
            expect(dispatcher.getCreateCalls()[0].name).toBe('new-bucket');
            expect(dispatcher.getCreateCalls()[0].actorId).toBe(actor.identity!.id);
            expect(dispatcher.getCreateCalls()[0].actorType).toBe('user');
        });

        it('should reject a refId, which only the owning service sets over the bus', async () => {
            await expect(service.create(
                {
                    name: 'new-bucket', 
                    refType: 'analysis', 
                    refId: randomUUID(), 
                },
                createAllowAllActor('realm-1'),
            )).rejects.toThrow(BadRequestError);
            expect(dispatcher.getCreateCalls()).toHaveLength(0);
        });

        it('should deny when actor lacks permission', async () => {
            await expect(
                service.create({ name: 'new-bucket' }, createDenyAllActor()),
            ).rejects.toThrow(PermissionError);
        });

        it('should throw PermissionDeniedError when actor has no identity', async () => {
            const actor = createAllowAllActor();
            actor.identity = undefined;

            await expect(
                service.create({ name: 'new-bucket' }, actor),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should set realmId from actor when not provided', async () => {
            const actor = createAllowAllActor('my-realm');

            await service.create({ name: 'new-bucket' }, actor);

            const call = dispatcher.getCreateCalls()[0];
            expect(call.realmId).toBe('my-realm');
        });

        it('should evaluate BUCKET_CREATE against the actor realm when none is provided', async () => {
            const actor = createScopedActor({ realmScope: 'own' });

            await service.create({ name: 'new-bucket' }, actor);

            const [call] = actor.permissionEvaluator.evaluateCalls;
            expect(call.name).toBe(PermissionName.BUCKET_CREATE);
            expect(call.data!.get(BuiltInPolicyType.REALM_MATCH)).toBe(actor.realm!.id);
            expect(dispatcher.getCreateCalls()[0].realmId).toBe(actor.realm!.id);
        });

        it('should deny when an own-scoped grant targets another realm', async () => {
            await expect(
                service.create(
                    { name: 'new-bucket', realmId: randomUUID() },
                    createScopedActor({ realmScope: 'own' }),
                ),
            ).rejects.toThrow(PermissionError);
            expect(dispatcher.getCreateCalls()).toHaveLength(0);
        });

        it('should create in another realm with an any-scoped grant', async () => {
            const realmId = randomUUID();

            await service.create(
                { name: 'new-bucket', realmId },
                createScopedActor({ realmScope: 'any' }),
            );

            expect(dispatcher.getCreateCalls()[0].realmId).toBe(realmId);
        });

        it('should delegate to dispatcher with only refType set', async () => {
            const actor = createAllowAllActor('realm-1');

            await service.create(
                { name: 'new-bucket', refType: 'analysis' },
                actor,
            );

            const call = dispatcher.getCreateCalls()[0];
            expect(call.refType).toBe('analysis');
            expect(call.refId).toBeUndefined();
        });

        it('should throw BadRequestError when only refId is set', async () => {
            await expect(
                service.create(
                    { name: 'new-bucket', refId: randomUUID() },
                    createAllowAllActor('realm-1'),
                ),
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('update', () => {
        it('should update existing entity', async () => {
            const bucket = createTestBucket();
            repository.seed(bucket);

            const result = await service.update(bucket.id, {}, createAllowAllActor());
            expect(result.id).toBe(bucket.id);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.update('nonexistent', {}, createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should skip permission check when actor owns the bucket', async () => {
            const actorId = randomUUID();
            const bucket = createTestBucket({
                actorId,
                actorType: 'user',
                realmId: 'other-realm',
            });
            repository.seed(bucket);

            const actor = createDenyAllActor();
            actor.identity = { id: actorId, type: 'user' };

            const result = await service.update(bucket.id, {}, actor);
            expect(result.id).toBe(bucket.id);
        });

        it('should deny when the grant does not reach the bucket realm', async () => {
            const bucket = createTestBucket({ realmId: 'other-realm' });
            repository.seed(bucket);

            await expect(
                service.update(bucket.id, {}, createScopedActor({ realmId: 'realm-1', realmScope: 'own' })),
            ).rejects.toThrow(PermissionError);
        });

        it('should update a bucket of another realm with an any-scoped grant', async () => {
            const bucket = createTestBucket({ realmId: 'other-realm' });
            repository.seed(bucket);

            const result = await service.update(bucket.id, {}, createScopedActor({ realmId: 'realm-1', realmScope: 'any' }));
            expect(result.id).toBe(bucket.id);
        });

        it('should evaluate BUCKET_UPDATE against both the stored and the merged row', async () => {
            const bucket = createTestBucket({ realmId: 'realm-1' });
            repository.seed(bucket);

            const actor = createScopedActor({ realmId: 'realm-1', realmScope: 'own' });
            await service.update(bucket.id, {}, actor);

            const calls = actor.permissionEvaluator.evaluateCalls;
            expect(calls.map((call) => call.name)).toEqual([PermissionName.BUCKET_UPDATE, PermissionName.BUCKET_UPDATE]);
            expect(calls.map((call) => call.data!.get(BuiltInPolicyType.REALM_MATCH))).toEqual(['realm-1', 'realm-1']);
            // The fake merge restamps updatedAt, so the second call carries the merged row.
            expect(calls[1].data!.get<Bucket>(BuiltInPolicyType.ATTRIBUTES).updatedAt)
                .not.toBe(calls[0].data!.get<Bucket>(BuiltInPolicyType.ATTRIBUTES).updatedAt);
        });

        it('should create minio bucket if it does not exist', async () => {
            const bucket = createTestBucket();
            repository.seed(bucket);

            await service.update(bucket.id, {}, createAllowAllActor());

            expect(storage.getMakeBucketCalls()).toHaveLength(1);
            expect(storage.getBuckets()).toHaveLength(1);
        });

        it('should not recreate minio bucket if it already exists', async () => {
            const bucket = createTestBucket();
            repository.seed(bucket);

            const bucketName = bucket.id
                .toLowerCase()
                .replace(/[^a-z0-9.-]/g, '')
                .slice(0, 63)
                .replace(/[^a-z0-9]+$/g, '');
            storage.addBucket(bucketName);

            await service.update(bucket.id, {}, createAllowAllActor());

            expect(storage.getMakeBucketCalls()).toHaveLength(0);
            expect(storage.getBuckets()).toHaveLength(1);
        });
    });

    describe('delete', () => {
        it('should delegate to dispatcher', async () => {
            const bucket = createTestBucket();
            repository.seed(bucket);

            const result = await service.delete(bucket.id, createAllowAllActor());
            expect(result.id).toBe(bucket.id);
            expect(dispatcher.getDeleteCalls()).toHaveLength(1);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should skip permission check when actor owns the bucket', async () => {
            const actorId = randomUUID();
            const bucket = createTestBucket({
                actorId,
                actorType: 'user',
            });
            repository.seed(bucket);

            const actor = createDenyAllActor();
            actor.identity = { id: actorId, type: 'user' };

            const result = await service.delete(bucket.id, actor);
            expect(result.id).toBe(bucket.id);
        });

        it('should deny when the grant does not reach the bucket realm', async () => {
            const bucket = createTestBucket({ realmId: 'other-realm' });
            repository.seed(bucket);

            await expect(
                service.delete(bucket.id, createScopedActor({ realmId: 'realm-1', realmScope: 'own' })),
            ).rejects.toThrow(PermissionError);
            expect(dispatcher.getDeleteCalls()).toHaveLength(0);
        });

        it('should delete a bucket of the own realm with an own-scoped grant', async () => {
            const bucket = createTestBucket({ realmId: 'realm-1' });
            repository.seed(bucket);

            const actor = createScopedActor({ realmId: 'realm-1', realmScope: 'own' });
            await service.delete(bucket.id, actor);

            expect(actor.permissionEvaluator.evaluateCalls[0].name).toBe(PermissionName.BUCKET_DELETE);
            expect(dispatcher.getDeleteCalls()).toEqual([bucket.id]);
        });
    });

    describe('clear', () => {
        it('should delegate to dispatcher', async () => {
            const bucket = createTestBucket();
            repository.seed(bucket);

            const result = await service.clear(bucket.id, createAllowAllActor());
            expect(result.id).toBe(bucket.id);
            expect(dispatcher.getClearCalls()).toEqual([bucket.id]);
            expect(dispatcher.getDeleteCalls()).toHaveLength(0);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.clear('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should skip permission check when actor owns the bucket', async () => {
            const actorId = randomUUID();
            const bucket = createTestBucket({
                actorId,
                actorType: 'user',
            });
            repository.seed(bucket);

            const actor = createDenyAllActor();
            actor.identity = { id: actorId, type: 'user' };

            const result = await service.clear(bucket.id, actor);
            expect(result.id).toBe(bucket.id);
        });

        it('should deny when non-owner lacks permission', async () => {
            const bucket = createTestBucket();
            repository.seed(bucket);

            await expect(
                service.clear(bucket.id, createDenyAllActor()),
            ).rejects.toThrow(PermissionError);
            expect(dispatcher.getClearCalls()).toHaveLength(0);
        });

        it('should deny when the grant does not reach the bucket realm', async () => {
            const bucket = createTestBucket({ realmId: 'other-realm' });
            repository.seed(bucket);

            await expect(
                service.clear(bucket.id, createScopedActor({ realmId: 'realm-1', realmScope: 'own' })),
            ).rejects.toThrow(PermissionError);
            expect(dispatcher.getClearCalls()).toHaveLength(0);
        });

        it('should clear a bucket of another realm with an any-scoped grant', async () => {
            const bucket = createTestBucket({ realmId: 'other-realm' });
            repository.seed(bucket);

            const actor = createScopedActor({ realmId: 'realm-1', realmScope: 'any' });
            await service.clear(bucket.id, actor);

            expect(actor.permissionEvaluator.evaluateCalls[0].name).toBe(PermissionName.BUCKET_DELETE);
            expect(dispatcher.getClearCalls()).toEqual([bucket.id]);
        });
    });

    describe('checkUploadAccess', () => {
        it('should let the owner upload without BUCKET_UPDATE', async () => {
            const actor = createDenyAllActor();
            const bucket = createTestBucket({
                actorId: actor.identity!.id,
                actorType: 'user',
                realmId: 'other-realm',
            });

            await expect(service.checkUploadAccess(bucket, actor)).resolves.toBeUndefined();
        });

        it('should deny a non-owner without BUCKET_UPDATE', async () => {
            await expect(
                service.checkUploadAccess(createTestBucket(), createDenyAllActor()),
            ).rejects.toThrow(PermissionError);
        });

        it('should let a BUCKET_UPDATE holder of the bucket realm upload', async () => {
            const actor = createScopedActor({ realmId: 'realm-1', realmScope: 'own' });

            await expect(service.checkUploadAccess(createTestBucket({ realmId: 'realm-1' }), actor)).resolves.toBeUndefined();
            expect(actor.permissionEvaluator.evaluateCalls[0].name).toBe(PermissionName.BUCKET_UPDATE);
        });

        it('should deny an own-scoped BUCKET_UPDATE holder of another realm', async () => {
            await expect(
                service.checkUploadAccess(
                    createTestBucket({ realmId: 'other-realm' }),
                    createScopedActor({ realmId: 'realm-1', realmScope: 'own' }),
                ),
            ).rejects.toThrow(PermissionError);
        });

        it('should leave a bucket with a ref to the owning service', async () => {
            const bucket = createTestBucket({ refType: 'analysis', refId: randomUUID() });

            await expect(service.checkUploadAccess(bucket, createDenyAllActor())).resolves.toBeUndefined();
        });

        it('should gate a bucket with only a refType like a ref-less one', async () => {
            await expect(
                service.checkUploadAccess(createTestBucket({ refType: 'analysis' }), createDenyAllActor()),
            ).rejects.toThrow(PermissionError);
        });
    });
});
