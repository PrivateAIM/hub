/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Bucket, BucketFile } from '@privateaim/storage-kit';
import { BuiltInPolicyType } from '@authup/access';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { BucketFileService } from '../../../../../src/core/entities/bucket-file/service.ts';
import {
    FakeEntityRepository,
    createAllowAllActor,
    createDenyAllActor,
    createScopedActor,
} from '@privateaim/server-test-kit';
import { FakeBucketFileCaller } from './fake-caller.ts';

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

describe('BucketFileService', () => {
    let repository: FakeEntityRepository<BucketFile>;
    let caller: FakeBucketFileCaller;
    let service: BucketFileService;

    beforeEach(() => {
        repository = new FakeEntityRepository<BucketFile>();
        caller = new FakeBucketFileCaller();
        service = new BucketFileService({ repository, caller });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestBucketFile({ id: 'bf-1' }),
                createTestBucketFile({ id: 'bf-2' }),
            ]);

            const result = await service.getMany({});
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const file = createTestBucketFile({ id: 'bf-1' });
            repository.seed(file);

            const result = await service.getOne('bf-1');
            expect(result.id).toBe('bf-1');
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete and delegate to caller', async () => {
            const file = createTestBucketFile();
            repository.seed(file);

            const result = await service.delete(file.id, createAllowAllActor());
            expect(result.id).toBe(file.id);
            expect(caller.getDeleteCalls()).toHaveLength(1);
            expect(caller.getDeleteCalls()[0]).toBe(file.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
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

            const result = await service.delete(file.id, actor);
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

            const result = await service.delete(file.id, actor);
            expect(result.id).toBe(file.id);
        });

        it('should throw PermissionDeniedError when the grant does not reach the file realm', async () => {
            const file = createTestBucketFile({
                actorId: 'other-user',
                actorType: 'user',
                realmId: 'other-realm',
                bucket: null,
            });
            repository.seed(file);

            await expect(
                service.delete(file.id, createScopedActor({ realmId: 'realm-1', realmScope: 'own' })),
            ).rejects.toThrow(PermissionDeniedError);
            expect(caller.getDeleteCalls()).toHaveLength(0);
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
            await service.delete(file.id, actor);

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

            await service.delete(file.id, createScopedActor({ realmId: 'realm-1', realmScope: 'any' }));
            expect(caller.getDeleteCalls()).toEqual([file.id]);
        });

        it('should throw PermissionDeniedError when actor lacks permission and is not owner', async () => {
            const file = createTestBucketFile({
                actorId: 'other-user',
                actorType: 'user',
                realmId: 'realm-1',
                bucket: null,
            });
            repository.seed(file);

            await expect(
                service.delete(file.id, createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });
    });
});
