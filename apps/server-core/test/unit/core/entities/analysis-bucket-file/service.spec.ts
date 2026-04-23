/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Analysis, AnalysisBucket, AnalysisBucketFile } from '@privateaim/core-kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisBucketFileService } from '../../../../../src/core/entities/analysis-bucket-file/service.ts';
import {
    FakeEntityRepository,
    createAllowAllActor,
} from '../../helpers/index.ts';
import { FakeAnalysisFileMetadataRecalculator } from './fake-metadata-recalculator.ts';

function createFakeBucketFileRepository(analysisId: string) {
    const repo = new FakeEntityRepository<AnalysisBucketFile>();

    const originalValidateJoinColumns = repo.validateJoinColumns.bind(repo);
    repo.validateJoinColumns = async (data: Partial<AnalysisBucketFile>) => {
        await originalValidateJoinColumns(data);

        if (!data.analysis_bucket) {
            data.analysis_bucket = {
                id: data.analysis_bucket_id,
                analysis_id: analysisId,
            } as AnalysisBucket;
        }
    };

    return repo;
}

function createTestBucketFile(analysisId: string, overrides?: Partial<AnalysisBucketFile>): AnalysisBucketFile {
    return {
        id: randomUUID(),
        path: 'main.py',
        root: false,
        analysis_id: analysisId,
        analysis_bucket_id: randomUUID(),
        analysis_bucket: { id: randomUUID(), analysis_id: analysisId } as AnalysisBucket,
        bucket_id: randomUUID(),
        bucket_file_id: randomUUID(),
        realm_id: 'realm-1',
        user_id: null,
        robot_id: null,
        client_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides,
    } as AnalysisBucketFile;
}

describe('AnalysisBucketFileService', () => {
    let repository: FakeEntityRepository<AnalysisBucketFile>;
    let recalculator: FakeAnalysisFileMetadataRecalculator;
    let service: AnalysisBucketFileService;
    let analysisId: string;

    beforeEach(() => {
        analysisId = randomUUID();

        repository = createFakeBucketFileRepository(analysisId);
        const analysisRepository = new FakeEntityRepository<Analysis>();
        recalculator = new FakeAnalysisFileMetadataRecalculator(analysisRepository);

        analysisRepository.seed({ id: analysisId, realm_id: 'realm-1' } as Analysis);

        service = new AnalysisBucketFileService({
            repository,
            recalculator,
        });
    });

    describe('create', () => {
        it('should call recalc for root file', async () => {
            await service.create(
                {
                    analysis_bucket_id: randomUUID(),
                    path: 'main.py',
                    bucket_id: randomUUID(),
                    bucket_file_id: randomUUID(),
                    root: true,
                },
                createAllowAllActor(),
            );

            expect(recalculator.getCallCount()).toBe(1);
            expect(recalculator.getCalls()[0]).toBe(analysisId);
        });

        it('should not call recalc for non-root file', async () => {
            await service.create(
                {
                    analysis_bucket_id: randomUUID(),
                    path: 'helper.py',
                    bucket_id: randomUUID(),
                    bucket_file_id: randomUUID(),
                    root: false,
                },
                createAllowAllActor(),
            );

            expect(recalculator.getCallCount()).toBe(0);
        });
    });

    describe('update', () => {
        it('should call recalcDebounced after save', async () => {
            const file = createTestBucketFile(analysisId);
            repository.seed(file);

            await service.update(file.id, { path: 'updated.py' }, createAllowAllActor());

            expect(recalculator.getDebouncedCallCount()).toBe(1);
            expect(recalculator.getDebouncedCalls()[0]).toBe(analysisId);
        });

        it('should not use immediate recalc on update', async () => {
            const file = createTestBucketFile(analysisId);
            repository.seed(file);

            await service.update(file.id, { path: 'updated.py' }, createAllowAllActor());

            expect(recalculator.getCallCount()).toBe(0);
        });
    });

    describe('delete', () => {
        it('should call recalc for root file', async () => {
            const file = createTestBucketFile(analysisId, { root: true });
            repository.seed(file);

            await service.delete(file.id, createAllowAllActor());

            expect(recalculator.getCallCount()).toBe(1);
            expect(recalculator.getCalls()[0]).toBe(analysisId);
        });

        it('should not call recalc for non-root file', async () => {
            const file = createTestBucketFile(analysisId, { root: false });
            repository.seed(file);

            await service.delete(file.id, createAllowAllActor());

            expect(recalculator.getCallCount()).toBe(0);
        });
    });
});
