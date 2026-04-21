/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { Analysis, AnalysisBucket } from '@privateaim/core-kit';
import { AnalysisBucketType, buildAnalysisBucketName } from '@privateaim/core-kit';
import { 
    beforeEach, 
    describe, 
    expect, 
    it, 
} from 'vitest';
import { AnalysisStorageManager } from '../../../../src/core/services/analysis-storage-manager/module.ts';
import {
    FakeBucketCaller,
    FakeEntityRepository,
    FakeTaskManager,
} from '../helpers/index.ts';
import { createFullAnalysis } from '../../../utils/domains/index.ts';

function createTestBucket(overrides?: Partial<AnalysisBucket>): AnalysisBucket {
    return {
        id: 'bucket-1',
        type: AnalysisBucketType.CODE,
        bucket_id: 'external-bucket-1',
        analysis_id: 'analysis-1',
        analysis: {} as Analysis,
        realm_id: 'realm-1',
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides,
    };
}

describe('AnalysisStorageManager', () => {
    let repository: FakeEntityRepository<Analysis>;
    let bucketRepository: FakeEntityRepository<AnalysisBucket>;
    let caller: FakeBucketCaller;
    let taskManager: FakeTaskManager;
    let storageManager: AnalysisStorageManager;

    beforeEach(() => {
        repository = new FakeEntityRepository<Analysis>();
        bucketRepository = new FakeEntityRepository<AnalysisBucket>();
        caller = new FakeBucketCaller();
        taskManager = new FakeTaskManager();
        storageManager = new AnalysisStorageManager({
            repository,
            bucketRepository,
            caller,
            taskManager,
        });
    });

    describe('check', () => {
        it('should create buckets for all types when none exist', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            await storageManager.check(analysis);

            const bucketTypes = Object.values(AnalysisBucketType);
            expect(taskManager.getCallCount()).toBe(bucketTypes.length);
            expect(caller.getCallsFor('callCreate')).toHaveLength(bucketTypes.length);
        });

        it('should create bucket with correct name and realm_id', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            await storageManager.check(analysis, { type: AnalysisBucketType.CODE });

            const createCalls = caller.getCallsFor('callCreate');
            expect(createCalls).toHaveLength(1);
            expect(createCalls[0].data).toEqual({
                name: buildAnalysisBucketName(AnalysisBucketType.CODE, 'analysis-1'),
                realm_id: 'realm-1',
            });
        });

        it('should create task with correct type and data', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            await storageManager.check(analysis, { type: AnalysisBucketType.CODE });

            const taskCalls = taskManager.getCallsFor('analysisBucketCreate');
            expect(taskCalls).toHaveLength(1);
            expect(taskCalls[0].data).toEqual({
                analysisId: 'analysis-1',
                bucketType: AnalysisBucketType.CODE,
            });
        });

        it('should pass correlationId from taskManager to caller', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            await storageManager.check(analysis, { type: AnalysisBucketType.CODE });

            const taskCalls = taskManager.getCalls();
            const createCalls = caller.getCallsFor('callCreate');
            expect(createCalls[0].meta!.correlationId).toBe(taskCalls[0].correlationId);
        });

        it('should skip existing buckets', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);
            bucketRepository.seed(createTestBucket({
                analysis_id: 'analysis-1',
                type: AnalysisBucketType.CODE,
            }));

            await storageManager.check(analysis, { type: AnalysisBucketType.CODE });

            expect(taskManager.getCallCount()).toBe(0);
            expect(caller.getCallCount()).toBe(0);
        });

        it('should only create missing buckets when some exist', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);
            bucketRepository.seed(createTestBucket({
                analysis_id: 'analysis-1',
                type: AnalysisBucketType.CODE,
            }));

            await storageManager.check(analysis);

            // CODE exists, so only RESULT and TEMP should be created
            expect(taskManager.getCallCount()).toBe(2);
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
        it('should remove existing buckets and create tasks', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);
            bucketRepository.seed(createTestBucket({
                id: 'bucket-code',
                analysis_id: 'analysis-1',
                type: AnalysisBucketType.CODE,
                bucket_id: 'ext-code',
            }));

            await storageManager.remove(analysis, { type: AnalysisBucketType.CODE });

            expect(taskManager.getCallsFor('analysisBucketDelete')).toHaveLength(1);
            const deleteCalls = caller.getCallsFor('callDelete');
            expect(deleteCalls).toHaveLength(1);
            expect(deleteCalls[0].data).toEqual({ id: 'ext-code' });
        });

        it('should pass correlationId from taskManager to caller', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);
            bucketRepository.seed(createTestBucket({
                analysis_id: 'analysis-1',
                type: AnalysisBucketType.CODE,
                bucket_id: 'ext-code',
            }));

            await storageManager.remove(analysis, { type: AnalysisBucketType.CODE });

            const taskCalls = taskManager.getCalls();
            const deleteCalls = caller.getCallsFor('callDelete');
            expect(deleteCalls[0].meta!.correlationId).toBe(taskCalls[0].correlationId);
        });

        it('should skip non-existing buckets', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            await storageManager.remove(analysis, { type: AnalysisBucketType.CODE });

            expect(taskManager.getCallCount()).toBe(0);
            expect(caller.getCallCount()).toBe(0);
        });

        it('should remove all bucket types when no type specified', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);
            bucketRepository.seed([
                createTestBucket({
                    id: 'bucket-code',
                    analysis_id: 'analysis-1',
                    type: AnalysisBucketType.CODE,
                    bucket_id: 'ext-code',
                }),
                createTestBucket({
                    id: 'bucket-result',
                    analysis_id: 'analysis-1',
                    type: AnalysisBucketType.RESULT,
                    bucket_id: 'ext-result',
                }),
                createTestBucket({
                    id: 'bucket-temp',
                    analysis_id: 'analysis-1',
                    type: AnalysisBucketType.TEMP,
                    bucket_id: 'ext-temp',
                }),
            ]);

            await storageManager.remove(analysis);

            expect(taskManager.getCallsFor('analysisBucketDelete')).toHaveLength(3);
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
});
