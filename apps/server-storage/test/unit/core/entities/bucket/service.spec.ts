/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Bucket } from '@privateaim/storage-kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import type { Client } from 'minio';
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
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '@privateaim/server-test-kit';
import { FakeBucketCaller } from './fake-caller.ts';
import { FakeBucketRepository } from './fake-repository.ts';
import { FakeMinioClient } from './fake-minio.ts';

function createTestBucket(overrides?: Partial<Bucket>): Bucket {
    return {
        id: randomUUID(),
        name: 'test-bucket',
        region: null,
        actor_id: null,
        actor_type: null,
        realm_id: 'realm-1',
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides,
    } as Bucket;
}

describe('BucketService', () => {
    let repository: FakeBucketRepository;
    let caller: FakeBucketCaller;
    let minio: FakeMinioClient;
    let service: BucketService;

    beforeEach(() => {
        repository = new FakeBucketRepository();
        caller = new FakeBucketCaller();
        minio = new FakeMinioClient();
        service = new BucketService({
            repository,
            caller,
            minio: minio as unknown as Client,
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

        it('should throw NotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(NotFoundError);
        });
    });

    describe('create', () => {
        it('should delegate to caller with actor info', async () => {
            const actor = createAllowAllActor('realm-1');

            const result = await service.create(
                { name: 'new-bucket' },
                actor,
            );

            expect(result).toBeDefined();
            expect(caller.getCreateCalls()).toHaveLength(1);
            expect(caller.getCreateCalls()[0].name).toBe('new-bucket');
            expect(caller.getCreateCalls()[0].actor_id).toBe(actor.identity!.id);
            expect(caller.getCreateCalls()[0].actor_type).toBe('user');
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            await expect(
                service.create({ name: 'new-bucket' }, createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw ForbiddenError when actor has no identity', async () => {
            const actor = createAllowAllActor();
            actor.identity = undefined;

            await expect(
                service.create({ name: 'new-bucket' }, actor),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should set realm_id from actor when not provided', async () => {
            const actor = createMasterRealmActor('my-realm');

            await service.create({ name: 'new-bucket' }, actor);

            const call = caller.getCreateCalls()[0];
            expect(call.realm_id).toBe('my-realm');
        });

        it('should throw ForbiddenError when non-master realm sets different realm_id', async () => {
            const actor = createNonMasterRealmActor('realm-1');
            const otherRealmId = randomUUID();

            await expect(
                service.create(
                    { name: 'new-bucket', realm_id: otherRealmId },
                    actor,
                ),
            ).rejects.toThrow(ForbiddenError);
        });
    });

    describe('update', () => {
        it('should update existing entity', async () => {
            const bucket = createTestBucket();
            repository.seed(bucket);

            const result = await service.update(bucket.id, {}, createMasterRealmActor());
            expect(result.id).toBe(bucket.id);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.update('nonexistent', {}, createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should skip permission check when actor owns the bucket', async () => {
            const actorId = randomUUID();
            const bucket = createTestBucket({
                actor_id: actorId,
                actor_type: 'user',
                realm_id: 'other-realm',
            });
            repository.seed(bucket);

            const actor = createDenyAllActor();
            actor.identity = { id: actorId, type: 'user' };

            const result = await service.update(bucket.id, {}, actor);
            expect(result.id).toBe(bucket.id);
        });

        it('should enforce realm writability for non-owner', async () => {
            const bucket = createTestBucket({ realm_id: 'other-realm' });
            repository.seed(bucket);

            await expect(
                service.update(bucket.id, {}, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should create minio bucket if it does not exist', async () => {
            const bucket = createTestBucket();
            repository.seed(bucket);

            await service.update(bucket.id, {}, createMasterRealmActor());

            expect(minio.getMakeBucketCalls()).toHaveLength(1);
            expect(minio.getBuckets()).toHaveLength(1);
        });

        it('should not recreate minio bucket if it already exists', async () => {
            const bucket = createTestBucket();
            repository.seed(bucket);

            const bucketName = bucket.id
                .toLowerCase()
                .replace(/[^a-z0-9.-]/g, '')
                .slice(0, 63)
                .replace(/[^a-z0-9]+$/g, '');
            minio.addBucket(bucketName);

            await service.update(bucket.id, {}, createMasterRealmActor());

            expect(minio.getMakeBucketCalls()).toHaveLength(0);
            expect(minio.getBuckets()).toHaveLength(1);
        });
    });

    describe('delete', () => {
        it('should delegate to caller', async () => {
            const bucket = createTestBucket();
            repository.seed(bucket);

            const result = await service.delete(bucket.id, createMasterRealmActor());
            expect(result.id).toBe(bucket.id);
            expect(caller.getDeleteCalls()).toHaveLength(1);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should skip permission check when actor owns the bucket', async () => {
            const actorId = randomUUID();
            const bucket = createTestBucket({
                actor_id: actorId,
                actor_type: 'user',
            });
            repository.seed(bucket);

            const actor = createDenyAllActor();
            actor.identity = { id: actorId, type: 'user' };

            const result = await service.delete(bucket.id, actor);
            expect(result.id).toBe(bucket.id);
        });

        it('should enforce realm writability for non-owner', async () => {
            const bucket = createTestBucket({ realm_id: 'other-realm' });
            repository.seed(bucket);

            await expect(
                service.delete(bucket.id, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(ForbiddenError);
        });
    });
});
