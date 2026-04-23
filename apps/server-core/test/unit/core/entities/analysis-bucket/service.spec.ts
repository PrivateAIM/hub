/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Analysis, AnalysisBucket } from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisBucketService } from '../../../../../src/core/entities/analysis-bucket/service.ts';
import {
    FakeEntityRepository,
    createAllowAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '../../helpers/index.ts';

function createFakeAnalysisBucketRepository() {
    const repo = new FakeEntityRepository<AnalysisBucket>();

    const originalValidateJoinColumns = repo.validateJoinColumns.bind(repo);
    repo.validateJoinColumns = async (data: Partial<AnalysisBucket>) => {
        await originalValidateJoinColumns(data);

        if (!data.analysis) {
            data.analysis = {
                id: data.analysis_id,
                realm_id: 'realm-1',
            } as Analysis;
        }
    };

    return repo;
}

function createTestAnalysisBucket(overrides?: Partial<AnalysisBucket>): AnalysisBucket {
    return {
        id: randomUUID(),
        type: AnalysisBucketType.CODE,
        bucket_id: randomUUID(),
        analysis_id: randomUUID(),
        realm_id: 'realm-1',
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides,
    } as AnalysisBucket;
}

describe('AnalysisBucketService', () => {
    let repository: FakeEntityRepository<AnalysisBucket>;
    let service: AnalysisBucketService;

    beforeEach(() => {
        repository = createFakeAnalysisBucketRepository();
        service = new AnalysisBucketService({ repository });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestAnalysisBucket({ id: 'ab-1' }),
                createTestAnalysisBucket({ id: 'ab-2' }),
            ]);

            const result = await service.getMany({});
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const bucket = createTestAnalysisBucket({ id: 'ab-1' });
            repository.seed(bucket);

            const result = await service.getOne('ab-1');
            expect(result.id).toBe('ab-1');
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(NotFoundError);
        });
    });

    describe('create', () => {
        it('should create with valid data', async () => {
            const analysisId = randomUUID();
            const bucketId = randomUUID();

            const result = await service.create(
                {
                    analysis_id: analysisId,
                    bucket_id: bucketId,
                    type: AnalysisBucketType.CODE,
                },
                createAllowAllActor(),
            );

            expect(result.analysis_id).toBe(analysisId);
            expect(result.bucket_id).toBe(bucketId);
            expect(result.realm_id).toBe('realm-1');
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should set realm_id from analysis', async () => {
            const result = await service.create(
                {
                    analysis_id: randomUUID(),
                    bucket_id: randomUUID(),
                    type: AnalysisBucketType.RESULT,
                },
                createAllowAllActor(),
            );

            expect(result.realm_id).toBe('realm-1');
        });
    });

    describe('update', () => {
        it('should update existing entity', async () => {
            const bucket = createTestAnalysisBucket();
            repository.seed(bucket);

            const result = await service.update(bucket.id, {}, createMasterRealmActor());
            expect(result.id).toBe(bucket.id);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.update('nonexistent', {}, createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should enforce realm writability for non-master realm', async () => {
            const bucket = createTestAnalysisBucket({ realm_id: 'other-realm' });
            repository.seed(bucket);

            await expect(
                service.update(bucket.id, {}, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should allow master realm to update any entity', async () => {
            const bucket = createTestAnalysisBucket({ realm_id: 'other-realm' });
            repository.seed(bucket);

            const result = await service.update(bucket.id, {}, createMasterRealmActor());
            expect(result.id).toBe(bucket.id);
        });
    });

    describe('delete', () => {
        it('should delete existing entity', async () => {
            const bucket = createTestAnalysisBucket();
            repository.seed(bucket);

            const result = await service.delete(bucket.id, createMasterRealmActor());
            expect(result.id).toBe(bucket.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should enforce realm writability for non-master realm', async () => {
            const bucket = createTestAnalysisBucket({ realm_id: 'other-realm' });
            repository.seed(bucket);

            await expect(
                service.delete(bucket.id, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should allow master realm to delete any entity', async () => {
            const bucket = createTestAnalysisBucket({ realm_id: 'other-realm' });
            repository.seed(bucket);

            const result = await service.delete(bucket.id, createMasterRealmActor());
            expect(result.id).toBe(bucket.id);
        });
    });
});
