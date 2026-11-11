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
import { BUCKET_READ_PERMISSIONS } from '../../../../../src/core/entities/bucket/constants.ts';
import type { ActorContext } from '@privateaim/server-kit';
import {
    createAllowAllActor,
    createDenyAllActor,
    createScopedActor,
} from '@privateaim/server-test-kit';
import { FakeBucketDispatcher } from './fake-dispatcher.ts';
import { FakeBucketRepository } from './fake-repository.ts';
import { FakeStorageAdapter } from './fake-storage.ts';
import type { StorageCapability, StorageRequester } from '../../../../../src/core/capability/types.ts';

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

function actorRequester(actor: ActorContext): StorageRequester {
    return { type: 'actor', actor };
}

function ownedBy(actor: ActorContext): Pick<Bucket, 'actorType' | 'actorId'> {
    if (!actor.identity) {
        throw new Error('The actor has no identity.');
    }

    return { actorType: actor.identity.type, actorId: actor.identity.id };
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

            const result = await service.getMany({}, actorRequester(createScopedActor({ realmScope: 'any' })));

            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
        });
    });

    describe('getOne', () => {
        const requester = () => actorRequester(createScopedActor({ realmScope: 'any' }));

        it('should return entity by ID', async () => {
            const bucket = createTestBucket({ id: 'b-1' });

            repository.seed(bucket);

            const result = await service.getOne('b-1', undefined, requester());

            expect(result.id).toBe('b-1');
        });

        it('should return entity by name', async () => {
            const bucket = createTestBucket({ name: 'my-bucket' });

            repository.seed(bucket);

            const result = await service.getOne('my-bucket', undefined, requester());

            expect(result.name).toBe('my-bucket');
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent', undefined, requester())).rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('identity read reach', () => {
        const realmA = randomUUID();
        const realmB = randomUUID();

        beforeEach(() => {
            repository.seed([
                createTestBucket({
                    id: 'a-1',
                    name: 'a-1',
                    realmId: realmA,
                }),
                createTestBucket({
                    id: 'b-1',
                    name: 'b-1',
                    realmId: realmB,
                }),
            ]);
        });

        const listIds = async (requester: StorageRequester) => (await service.getMany({}, requester)).data
            .map((item) => item.id);

        it('should pre-gate the read permissions as a one-of', async () => {
            const actor = createScopedActor({ realmScope: 'any' });

            await service.getMany({}, actorRequester(actor));

            expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0].name).toEqual(BUCKET_READ_PERMISSIONS);
            expect(actor.permissionEvaluator.compileCalls[0]).toEqual({ name: BUCKET_READ_PERMISSIONS });
        });

        it('should narrow a realm-scoped grant to that realm', async () => {
            const requester = actorRequester(createScopedActor({ realmScope: 'own', realmId: realmA }));

            expect(await listIds(requester)).toEqual(['a-1']);
            await expect(service.getOne('a-1', undefined, requester)).resolves.toMatchObject({ id: 'a-1' });
            await expect(service.getOne('b-1', undefined, requester)).rejects.toThrow(EntityNotFoundError);
            await expect(service.getOne('b-1', { fields: 'name' }, requester)).rejects.toThrow(EntityNotFoundError);
        });

        it('should reach every bucket with an unbounded grant', async () => {
            expect(await listIds(actorRequester(createScopedActor({ realmScope: 'any' })))).toEqual(['a-1', 'b-1']);
        });

        it('should list nothing without a permission, not refuse', async () => {
            const requester = actorRequester(createDenyAllActor(realmA));

            expect(await listIds(requester)).toEqual([]);
            await expect(service.getOne('a-1', undefined, requester)).rejects.toThrow(EntityNotFoundError);
            await expect(service.getOne('a-1', { fields: 'name' }, requester)).rejects.toThrow(EntityNotFoundError);
        });

        it('should not widen the reach through a filter', async () => {
            const requester = actorRequester(createScopedActor({ realmScope: 'own', realmId: realmA }));

            const result = await service.getMany({ filter: { realmId: realmB } }, requester);

            expect(result.data).toEqual([]);
        });

        it('should let the owner read its bucket without a permission', async () => {
            const actor = createDenyAllActor(realmA);

            repository.seed(createTestBucket({
                id: 'owned',
                name: 'owned',
                realmId: realmB,
                ...ownedBy(actor),
            }));

            expect(await listIds(actorRequester(actor))).toEqual(['owned']);
            await expect(service.getOne('owned', undefined, actorRequester(actor))).resolves.toMatchObject({ id: 'owned' });
        });

        it('should combine the realm grant and ownership', async () => {
            const actor = createScopedActor({ realmScope: 'own', realmId: realmA });

            repository.seed(createTestBucket({
                id: 'owned',
                name: 'owned',
                realmId: realmB,
                ...ownedBy(actor),
            }));

            expect(await listIds(actorRequester(actor))).toEqual(['a-1', 'owned']);
        });

        it('should propagate an evaluator failure that is no denial', async () => {
            const actor = createAllowAllActor(realmA);

            actor.permissionEvaluator.denyAll(new Error('authup unavailable'));

            await expect(service.getMany({}, actorRequester(actor))).rejects.toThrow('authup unavailable');
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

            await expect(service.checkUploadAccess(bucket, { type: 'actor', actor })).resolves.toBeUndefined();
        });

        it('should deny a non-owner without BUCKET_UPDATE', async () => {
            await expect(
                service.checkUploadAccess(createTestBucket(), { type: 'actor', actor: createDenyAllActor() }),
            ).rejects.toThrow(PermissionError);
        });

        it('should let a BUCKET_UPDATE holder of the bucket realm upload', async () => {
            const actor = createScopedActor({ realmId: 'realm-1', realmScope: 'own' });

            await expect(service.checkUploadAccess(createTestBucket({ realmId: 'realm-1' }), { type: 'actor', actor })).resolves.toBeUndefined();
            expect(actor.permissionEvaluator.evaluateCalls[0].name).toBe(PermissionName.BUCKET_UPDATE);
        });

        it('should deny an own-scoped BUCKET_UPDATE holder of another realm', async () => {
            await expect(
                service.checkUploadAccess(
                    createTestBucket({ realmId: 'other-realm' }),
                    { type: 'actor', actor: createScopedActor({ realmId: 'realm-1', realmScope: 'own' }) },
                ),
            ).rejects.toThrow(PermissionError);
        });

        it('should gate a bucket with a ref like a ref-less one', async () => {
            const bucket = createTestBucket({ refType: 'analysis', refId: randomUUID() });

            await expect(
                service.checkUploadAccess(bucket, { type: 'actor', actor: createDenyAllActor() }),
            ).rejects.toThrow(PermissionError);
        });

        it('should let the owner of a bucket with a ref upload', async () => {
            const actor = createDenyAllActor();
            const bucket = createTestBucket({
                refType: 'analysis',
                refId: randomUUID(),
                actorId: actor.identity!.id,
                actorType: 'user',
            });

            await expect(service.checkUploadAccess(bucket, { type: 'actor', actor })).resolves.toBeUndefined();
        });

        it('should gate a bucket with only a refType like a ref-less one', async () => {
            await expect(
                service.checkUploadAccess(createTestBucket({ refType: 'analysis' }), { type: 'actor', actor: createDenyAllActor() }),
            ).rejects.toThrow(PermissionError);
        });
    });

    describe('capability', () => {
        function createCapability(...entries: string[]): StorageCapability {
            return {
                subject: {
                    id: randomUUID(),
                    type: 'user',
                    realmId: 'realm-1',
                },
                entries: entries.map((entry) => {
                    const [type, id, actions] = entry.split(':');

                    return {
                        type,
                        id,
                        actions: actions.split(','),
                    };
                }),
            };
        }

        function capabilityRequester(...entries: string[]): StorageRequester {
            return { type: 'capability', capability: createCapability(...entries) };
        }

        it('should list only the buckets covered for read', async () => {
            repository.seed([
                createTestBucket({ id: 'b-1' }),
                createTestBucket({ id: 'b-2' }),
                createTestBucket({ id: 'b-3' }),
            ]);

            const result = await service.getMany({}, capabilityRequester('bucket:b-1:read', 'bucket:b-2:write'));

            expect(result.data.map((item) => item.id)).toEqual(['b-1']);
        });

        it('should not widen the list through a filter', async () => {
            repository.seed([
                createTestBucket({ id: 'b-1' }),
                createTestBucket({ id: 'b-2' }),
            ]);

            const result = await service.getMany(
                { filter: { id: 'b-2' } },
                capabilityRequester('bucket:b-1:read'),
            );

            expect(result.data).toEqual([]);
        });

        it('should list nothing for a capability naming no bucket', async () => {
            repository.seed(createTestBucket({ id: 'b-1' }));

            const result = await service.getMany({}, capabilityRequester('bucket-file:f-1:read'));

            expect(result.data).toEqual([]);
        });

        it('should read a covered bucket, also by name', async () => {
            repository.seed(createTestBucket({ id: 'b-1', name: 'named' }));

            const capability = createCapability('bucket:b-1:read');

            await expect(service.getOne('b-1', undefined, { type: 'capability', capability })).resolves.toMatchObject({ id: 'b-1' });
            await expect(service.getOne('named', undefined, { type: 'capability', capability })).resolves.toMatchObject({ id: 'b-1' });
        });

        it('should deny a bucket the capability does not cover for read', async () => {
            repository.seed(createTestBucket({ id: 'b-1' }));

            await expect(
                service.getOne('b-1', undefined, capabilityRequester('bucket:b-2:read', 'bucket:b-1:write')),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should let a capability with write upload', async () => {
            const bucket = createTestBucket({ id: 'b-1' });

            await expect(service.checkUploadAccess(bucket, {
                type: 'capability',
                capability: createCapability('bucket:b-1:write'),
            })).resolves.toBeUndefined();
        });

        it('should deny an upload without write, even into a bucket with a ref', async () => {
            const bucket = createTestBucket({
                id: 'b-1',
                refType: 'analysis',
                refId: randomUUID(),
            });

            await expect(service.checkUploadAccess(bucket, {
                type: 'capability',
                capability: createCapability('bucket:b-1:read,delete'),
            })).rejects.toThrow(PermissionDeniedError);
        });
    });
});
