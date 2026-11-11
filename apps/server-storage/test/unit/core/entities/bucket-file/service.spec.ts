/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Bucket, BucketFile } from '@privateaim/storage-kit';
import { BuiltInPolicyType, PermissionError } from '@authup/access';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { BucketFileService } from '../../../../../src/core/entities/bucket-file/service.ts';
import type { ActorContext } from '@privateaim/server-kit';
import {
    FakeEntityRepository,
    createAllowAllActor,
    createDenyAllActor,
    createScopedActor,
} from '@privateaim/server-test-kit';
import { FakeBucketFileDispatcher } from './fake-dispatcher.ts';
import type { StorageCapability, StorageRequester } from '../../../../../src/core/capability/types.ts';

function createTestBucketFile(overrides?: Partial<BucketFile>): BucketFile {
    return {
        id: randomUUID(),
        name: 'test-file.txt',
        path: '/data/test-file.txt',
        hash: 'abc123',
        directory: '/data',
        size: 1024,
        actorId: 'user-1',
        actorType: 'user',
        realmId: 'realm-1',
        bucketId: randomUUID(),
        bucket: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as BucketFile;
}

function createTestBucket(overrides: Partial<Bucket>): Bucket {
    return {
        id: randomUUID(),
        name: randomUUID(),
        region: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        actorId: null,
        actorType: null,
        realmId: null,
        refType: null,
        refId: null,
        ...overrides,
    };
}

function actorRequester(actor: ActorContext): StorageRequester {
    return { type: 'actor', actor };
}

function ownedBy(actor: ActorContext): Pick<BucketFile, 'actorType' | 'actorId'> {
    if (!actor.identity) {
        throw new Error('The actor has no identity.');
    }

    return { actorType: actor.identity.type, actorId: actor.identity.id };
}

describe('BucketFileService', () => {
    let repository: FakeEntityRepository<BucketFile>;
    let dispatcher: FakeBucketFileDispatcher;
    let service: BucketFileService;

    beforeEach(() => {
        repository = new FakeEntityRepository<BucketFile>();
        dispatcher = new FakeBucketFileDispatcher();
        service = new BucketFileService({ repository, dispatcher });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestBucketFile({ id: 'bf-1' }),
                createTestBucketFile({ id: 'bf-2' }),
            ]);

            const result = await service.getMany({}, actorRequester(createScopedActor({ realmScope: 'any' })));

            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
        });
    });

    describe('getOne', () => {
        const requester = () => actorRequester(createScopedActor({ realmScope: 'any' }));

        it('should return entity by ID', async () => {
            const file = createTestBucketFile({ id: 'bf-1' });

            repository.seed(file);

            const result = await service.getOne('bf-1', undefined, requester());

            expect(result.id).toBe('bf-1');
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent', undefined, requester())).rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('identity read reach', () => {
        const realmA = randomUUID();
        const realmB = randomUUID();

        const bucketA = createTestBucket({ id: 'bucket-a', realmId: realmA });
        const bucketB = createTestBucket({ id: 'bucket-b', realmId: realmB });

        beforeEach(() => {
            repository.seed([
                // Uploaded by realm B into realm A's bucket: the bucket decides.
                createTestBucketFile({
                    id: 'f-a',
                    bucketId: bucketA.id,
                    bucket: bucketA,
                    realmId: realmB,
                }),
                createTestBucketFile({
                    id: 'f-b',
                    bucketId: bucketB.id,
                    bucket: bucketB,
                    realmId: realmA,
                }),
            ]);
        });

        const listIds = async (requester: StorageRequester, query: Record<string, any> = {}) => (
            await service.getMany(query, requester)
        ).data.map((item) => item.id);

        it('should reach a file through its bucket realm, not its own', async () => {
            const realmAGrant = actorRequester(createScopedActor({ realmScope: 'own', realmId: realmA }));

            expect(await listIds(realmAGrant)).toEqual(['f-a']);
            await expect(service.getOne('f-a', undefined, realmAGrant)).resolves.toMatchObject({ id: 'f-a' });
            await expect(service.getOne('f-b', undefined, realmAGrant)).rejects.toThrow(EntityNotFoundError);

            const realmBGrant = actorRequester(createScopedActor({ realmScope: 'own', realmId: realmB }));

            expect(await listIds(realmBGrant)).toEqual(['f-b']);
            await expect(service.getOne('f-a', undefined, realmBGrant)).rejects.toThrow(EntityNotFoundError);
        });

        it('should not widen the reach through a bucket filter', async () => {
            const requester = actorRequester(createScopedActor({ realmScope: 'own', realmId: realmA }));

            expect(await listIds(requester, { filter: { bucketId: bucketB.id } })).toEqual([]);
        });

        it('should list nothing without a permission, not refuse', async () => {
            const requester = actorRequester(createDenyAllActor(realmA));

            expect(await listIds(requester)).toEqual([]);
            await expect(service.getOne('f-a', undefined, requester)).rejects.toThrow(EntityNotFoundError);
        });

        it('should let the bucket owner read its files without a permission', async () => {
            const actor = createDenyAllActor(realmB);
            const owned = createTestBucket({
                id: 'bucket-owned',
                realmId: realmA,
                ...ownedBy(actor),
            });

            repository.seed(createTestBucketFile({
                id: 'f-owned',
                bucketId: owned.id,
                bucket: owned,
                actorId: randomUUID(),
            }));

            expect(await listIds(actorRequester(actor))).toEqual(['f-owned']);
            await expect(service.getOne('f-owned', undefined, actorRequester(actor))).resolves.toMatchObject({ id: 'f-owned' });
        });

        it('should not let the uploader read a file of a bucket it does not reach', async () => {
            const actor = createDenyAllActor(realmB);

            repository.seed(createTestBucketFile({
                id: 'f-uploaded',
                bucketId: bucketA.id,
                bucket: bucketA,
                ...ownedBy(actor),
            }));

            expect(await listIds(actorRequester(actor))).toEqual([]);
        });
    });

    describe('delete', () => {
        it('should delete and delegate to dispatcher', async () => {
            const file = createTestBucketFile();

            repository.seed(file);

            const result = await service.delete(file.id, { type: 'actor', actor: createAllowAllActor() });

            expect(result.id).toBe(file.id);
            expect(dispatcher.getDeleteCalls()).toHaveLength(1);
            expect(dispatcher.getDeleteCalls()[0]).toBe(file.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', { type: 'actor', actor: createAllowAllActor() }),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should skip permission check when actor owns the file', async () => {
            const actorId = randomUUID();
            const file = createTestBucketFile({
                actorId,
                actorType: 'user',
                realmId: 'other-realm',
            });

            repository.seed(file);

            const actor = createDenyAllActor();

            actor.identity = { id: actorId, type: 'user' };

            const result = await service.delete(file.id, { type: 'actor', actor });

            expect(result.id).toBe(file.id);
        });

        it('should skip permission check when actor owns the bucket', async () => {
            const actorId = randomUUID();
            const file = createTestBucketFile({
                actorId: 'other-user',
                actorType: 'user',
                realmId: 'other-realm',
                bucket: {
                    actorId,
                    actorType: 'user',
                } as Bucket,
            });

            repository.seed(file);

            const actor = createDenyAllActor();

            actor.identity = { id: actorId, type: 'user' };

            const result = await service.delete(file.id, { type: 'actor', actor });

            expect(result.id).toBe(file.id);
        });

        it('should deny when the grant does not reach the file realm', async () => {
            const file = createTestBucketFile({
                actorId: 'other-user',
                actorType: 'user',
                realmId: 'other-realm',
                bucket: null,
            });

            repository.seed(file);

            await expect(
                service.delete(file.id, { type: 'actor', actor: createScopedActor({ realmId: 'realm-1', realmScope: 'own' }) }),
            ).rejects.toThrow(PermissionError);
            expect(dispatcher.getDeleteCalls()).toHaveLength(0);
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should delete a file of the own realm with an own-scoped grant', async () => {
            const file = createTestBucketFile({
                actorId: 'other-user',
                actorType: 'user',
                realmId: 'realm-1',
                bucket: null,
            });

            repository.seed(file);

            const actor = createScopedActor({ realmId: 'realm-1', realmScope: 'own' });

            await service.delete(file.id, { type: 'actor', actor });

            const [call] = actor.permissionEvaluator.evaluateCalls;

            expect(call.name).toBe(PermissionName.BUCKET_UPDATE);
            expect(call.data!.get(BuiltInPolicyType.REALM_MATCH)).toBe('realm-1');
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should delete a file of another realm with an any-scoped grant', async () => {
            const file = createTestBucketFile({
                actorId: 'other-user',
                actorType: 'user',
                realmId: 'other-realm',
                bucket: null,
            });

            repository.seed(file);

            await service.delete(file.id, { type: 'actor', actor: createScopedActor({ realmId: 'realm-1', realmScope: 'any' }) });
            expect(dispatcher.getDeleteCalls()).toEqual([file.id]);
        });

        it('should deny when actor lacks permission and is not owner', async () => {
            const file = createTestBucketFile({
                actorId: 'other-user',
                actorType: 'user',
                realmId: 'realm-1',
                bucket: null,
            });

            repository.seed(file);

            await expect(
                service.delete(file.id, { type: 'actor', actor: createDenyAllActor() }),
            ).rejects.toThrow(PermissionError);
        });
    });

    describe('capability', () => {
        function createCapability(...entries: string[]): StorageCapability {
            return {
                subject: {
                    id: randomUUID(),
                    type: 'client',
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

        it('should list the files of covered buckets and covered files', async () => {
            repository.seed([
                createTestBucketFile({ id: 'f-1', bucketId: 'b-1' }),
                createTestBucketFile({ id: 'f-2', bucketId: 'b-2' }),
                createTestBucketFile({ id: 'f-3', bucketId: 'b-2' }),
                createTestBucketFile({ id: 'f-4', bucketId: 'b-3' }),
            ]);

            const result = await service.getMany({}, capabilityRequester(
                'bucket:b-1:read',
                'bucket-file:f-3:read',
                'bucket:b-3:write,delete',
            ));

            expect(result.data.map((item) => item.id)).toEqual(['f-1', 'f-3']);
        });

        it('should not list files of another bucket through a filter', async () => {
            repository.seed([
                createTestBucketFile({ id: 'f-1', bucketId: 'b-1' }),
                createTestBucketFile({ id: 'f-2', bucketId: 'b-2' }),
            ]);

            const result = await service.getMany(
                { filter: { bucketId: 'b-2' } },
                capabilityRequester('bucket:b-1:read'),
            );

            expect(result.data).toEqual([]);
        });

        it('should list nothing for a capability covering no read', async () => {
            repository.seed(createTestBucketFile({ id: 'f-1', bucketId: 'b-1' }));

            const result = await service.getMany({}, capabilityRequester('bucket:b-1:write'));

            expect(result.data).toEqual([]);
        });

        it('should read a file covered through its bucket or by itself', async () => {
            repository.seed([
                createTestBucketFile({ id: 'f-1', bucketId: 'b-1' }),
                createTestBucketFile({ id: 'f-2', bucketId: 'b-2' }),
            ]);

            const capability = createCapability('bucket:b-1:read', 'bucket-file:f-2:read');

            await expect(service.getOne('f-1', undefined, { type: 'capability', capability })).resolves.toMatchObject({ id: 'f-1' });
            await expect(service.getOne('f-2', undefined, { type: 'capability', capability })).resolves.toMatchObject({ id: 'f-2' });
        });

        it('should deny a file the capability does not cover for read', async () => {
            repository.seed(createTestBucketFile({ id: 'f-1', bucketId: 'b-1' }));

            await expect(
                service.getOne('f-1', undefined, capabilityRequester('bucket:b-2:read', 'bucket-file:f-1:delete')),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should delete a file covered for delete without an ownership check', async () => {
            const file = createTestBucketFile({
                id: 'f-1',
                bucketId: 'b-1',
                actorId: randomUUID(),
            });

            repository.seed(file);

            const result = await service.delete('f-1', {
                type: 'capability',
                capability: createCapability('bucket:b-1:delete'),
            });

            expect(result.id).toBe('f-1');
            expect(dispatcher.getDeleteCalls()).toEqual(['f-1']);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should deny the bucket relation of a file to a file-only capability', async () => {
            repository.seed(createTestBucketFile({ id: 'f-1', bucketId: 'b-1' }));

            const capability = createCapability('bucket-file:f-1:read');

            await expect(service.getOne('f-1', { include: 'bucket' }, { type: 'capability', capability })).rejects.toThrow(PermissionDeniedError);
            await expect(service.getOne('f-1', {}, { type: 'capability', capability })).resolves.toMatchObject({ id: 'f-1' });
        });

        it('should grant the bucket relation of a file to a bucket capability', async () => {
            repository.seed(createTestBucketFile({ id: 'f-1', bucketId: 'b-1' }));

            await expect(
                service.getOne('f-1', { include: 'bucket' }, capabilityRequester('bucket:b-1:read')),
            ).resolves.toMatchObject({ id: 'f-1' });
        });

        it('should list with the bucket relation only files of covered buckets', async () => {
            repository.seed([
                createTestBucketFile({ id: 'f-1', bucketId: 'b-1' }),
                createTestBucketFile({ id: 'f-2', bucketId: 'b-2' }),
            ]);

            const result = await service.getMany(
                { include: 'bucket' },
                capabilityRequester('bucket:b-1:read', 'bucket-file:f-2:read'),
            );

            expect(result.data.map((item) => item.id)).toEqual(['f-1']);
        });

        it('should deny deleting a file covered only for read', async () => {
            repository.seed(createTestBucketFile({ id: 'f-1', bucketId: 'b-1' }));

            await expect(service.delete('f-1', {
                type: 'capability',
                capability: createCapability('bucket:b-1:read', 'bucket-file:f-1:read'),
            })).rejects.toThrow(PermissionDeniedError);

            expect(dispatcher.getDeleteCalls()).toHaveLength(0);
            expect(repository.getAll()).toHaveLength(1);
        });
    });
});
