/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@privateaim/errors';
import type { Analysis, AnalysisBucket } from '@privateaim/core-kit';
import {
    AnalysisBucketType,
    DomainType,
    buildAnalysisBucketName,
} from '@privateaim/core-kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisStorageManager } from '../../../../src/core/services/analysis-storage-manager/module.ts';
import { FakeEntityRepository } from '@privateaim/server-test-kit';
import { FakeBucketCaller } from './helpers/fake-bucket-caller.ts';
import { createFullAnalysis } from '../../../utils/domains/index.ts';

function createTestBucket(overrides?: Partial<AnalysisBucket>): AnalysisBucket {
    return {
        id: 'bucket-1',
        type: AnalysisBucketType.CODE,
        bucketId: 'external-bucket-1',
        analysisId: 'analysis-1',
        analysis: {} as Analysis,
        realmId: 'realm-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

describe('AnalysisStorageManager', () => {
    let repository: FakeEntityRepository<Analysis>;
    let bucketRepository: FakeEntityRepository<AnalysisBucket>;
    let caller: FakeBucketCaller;
    let storageManager: AnalysisStorageManager;

    beforeEach(() => {
        repository = new FakeEntityRepository<Analysis>();
        bucketRepository = new FakeEntityRepository<AnalysisBucket>();
        caller = new FakeBucketCaller();
        storageManager = new AnalysisStorageManager({
            repository,
            bucketRepository,
            caller,
        });
    });

    describe('check', () => {
        it('should create buckets for all types when none exist', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            await storageManager.check(analysis);

            const bucketTypes = Object.values(AnalysisBucketType);
            expect(caller.getCallsFor('callCreate')).toHaveLength(bucketTypes.length);
        });

        it('should create bucket with correct name and realmId', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            await storageManager.check(analysis, { type: AnalysisBucketType.CODE });

            const createCalls = caller.getCallsFor('callCreate');
            expect(createCalls).toHaveLength(1);
            expect(createCalls[0].data).toEqual({
                name: buildAnalysisBucketName(AnalysisBucketType.CODE, 'analysis-1'),
                realmId: 'realm-1',
                refType: DomainType.ANALYSIS,
                refId: 'analysis-1',
            });
        });

        it('should skip existing buckets', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);
            bucketRepository.seed(createTestBucket({
                analysisId: 'analysis-1',
                type: AnalysisBucketType.CODE,
            }));

            await storageManager.check(analysis, { type: AnalysisBucketType.CODE });

            expect(caller.getCallCount()).toBe(0);
        });

        it('should only create missing buckets when some exist', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);
            bucketRepository.seed(createTestBucket({
                analysisId: 'analysis-1',
                type: AnalysisBucketType.CODE,
            }));

            await storageManager.check(analysis);

            // CODE exists, so only RESULT and TEMP should be created
            expect(caller.getCallsFor('callCreate')).toHaveLength(2);
        });

        it('should resolve entity by string ID', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            const result = await storageManager.check('analysis-1', { type: AnalysisBucketType.CODE });
            expect(result.id).toBe('analysis-1');
            expect(caller.getCallCount()).toBe(1);
        });

        it('should throw for missing entity', async () => {
            await expect(storageManager.check('nonexistent')).rejects.toThrow(BadRequestError);
        });
    });

    describe('remove', () => {
        it('should remove existing buckets', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);
            bucketRepository.seed(createTestBucket({
                id: 'bucket-code',
                analysisId: 'analysis-1',
                type: AnalysisBucketType.CODE,
                bucketId: 'ext-code',
            }));

            await storageManager.remove(analysis, { type: AnalysisBucketType.CODE });

            const deleteCalls = caller.getCallsFor('callDelete');
            expect(deleteCalls).toHaveLength(1);
            expect(deleteCalls[0].data).toEqual({ id: 'ext-code' });
        });

        it('should skip non-existing buckets', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            await storageManager.remove(analysis, { type: AnalysisBucketType.CODE });

            expect(caller.getCallCount()).toBe(0);
        });

        it('should remove all bucket types when no type specified', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);
            bucketRepository.seed([
                createTestBucket({
                    id: 'bucket-code',
                    analysisId: 'analysis-1',
                    type: AnalysisBucketType.CODE,
                    bucketId: 'ext-code',
                }),
                createTestBucket({
                    id: 'bucket-result',
                    analysisId: 'analysis-1',
                    type: AnalysisBucketType.RESULT,
                    bucketId: 'ext-result',
                }),
                createTestBucket({
                    id: 'bucket-temp',
                    analysisId: 'analysis-1',
                    type: AnalysisBucketType.TEMP,
                    bucketId: 'ext-temp',
                }),
            ]);

            await storageManager.remove(analysis);

            expect(caller.getCallsFor('callDelete')).toHaveLength(3);
        });

        it('should resolve entity by string ID', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            const result = await storageManager.remove('analysis-1');
            expect(result.id).toBe('analysis-1');
        });

        it('should throw for missing entity', async () => {
            await expect(storageManager.remove('nonexistent')).rejects.toThrow(BadRequestError);
        });
    });
    describe('clear', () => {
        it('should clear the requested bucket', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);
            bucketRepository.seed(createTestBucket({
                analysisId: 'analysis-1',
                type: AnalysisBucketType.TEMP,
                bucketId: 'ext-temp',
            }));

            await storageManager.clear(analysis, { type: AnalysisBucketType.TEMP });

            const clearCalls = caller.getCallsFor('callClear');
            expect(clearCalls).toHaveLength(1);
            expect(clearCalls[0].data).toEqual({ id: 'ext-temp' });
        });

        it('should skip non-existing buckets', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            await storageManager.clear(analysis, { type: AnalysisBucketType.TEMP });

            expect(caller.getCallCount()).toBe(0);
        });

        it('should only clear the requested type', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);
            bucketRepository.seed([
                createTestBucket({
                    id: 'bucket-code',
                    analysisId: 'analysis-1',
                    type: AnalysisBucketType.CODE,
                    bucketId: 'ext-code',
                }),
                createTestBucket({
                    id: 'bucket-temp',
                    analysisId: 'analysis-1',
                    type: AnalysisBucketType.TEMP,
                    bucketId: 'ext-temp',
                }),
            ]);

            await storageManager.clear(analysis, { type: AnalysisBucketType.TEMP });

            expect(caller.getCallsFor('callClear').map((c) => c.data)).toEqual([{ id: 'ext-temp' }]);
        });

        it('should throw for missing entity', async () => {
            await expect(storageManager.clear('nonexistent')).rejects.toThrow(BadRequestError);
        });
    });
});
