/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Bucket, BucketFile } from '@privateaim/storage-kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { BucketFileService } from '../../../../src/core/entities/bucket-file/service.ts';
import {
    FakeBucketFileCaller,
    FakeEntityRepository,
    createAllowAllActor,
    createDenyAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '../helpers/index.ts';

function createTestBucketFile(overrides?: Partial<BucketFile>): BucketFile {
    return {
        id: randomUUID(),
        name: 'test-file.txt',
        path: '/data/test-file.txt',
        hash: 'abc123',
        directory: '/data',
        size: 1024,
        actor_id: 'user-1',
        actor_type: 'user',
        realm_id: 'realm-1',
        bucket_id: randomUUID(),
        bucket: null,
        created_at: new Date(),
        updated_at: new Date(),
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

        it('should throw NotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete and delegate to caller', async () => {
            const file = createTestBucketFile();
            repository.seed(file);

            const result = await service.delete(file.id, createMasterRealmActor());
            expect(result.id).toBe(file.id);
            expect(caller.getDeleteCalls()).toHaveLength(1);
            expect(caller.getDeleteCalls()[0]).toBe(file.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should skip permission check when actor owns the file', async () => {
            const actorId = randomUUID();
            const file = createTestBucketFile({
                actor_id: actorId,
                actor_type: 'user',
                realm_id: 'other-realm',
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
                actor_id: 'other-user',
                actor_type: 'user',
                realm_id: 'other-realm',
                bucket: {
                    actor_id: actorId,
                    actor_type: 'user',
                } as Bucket,
            });
            repository.seed(file);

            const actor = createDenyAllActor();
            actor.identity = { id: actorId, type: 'user' };

            const result = await service.delete(file.id, actor);
            expect(result.id).toBe(file.id);
        });

        it('should enforce realm writability for non-owner', async () => {
            const file = createTestBucketFile({
                actor_id: 'other-user',
                actor_type: 'user',
                realm_id: 'other-realm',
                bucket: null,
            });
            repository.seed(file);

            await expect(
                service.delete(file.id, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw ForbiddenError when actor lacks permission and is not owner', async () => {
            const file = createTestBucketFile({
                actor_id: 'other-user',
                actor_type: 'user',
                realm_id: 'realm-1',
                bucket: null,
            });
            repository.seed(file);

            await expect(
                service.delete(file.id, createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });
    });
});
