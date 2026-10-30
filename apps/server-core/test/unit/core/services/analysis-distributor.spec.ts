/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@privateaim/errors';
import { AnalysisError, NodeType  } from '@privateaim/core-kit';
import type {
    Analysis,
    AnalysisNode,
    Node,
    Registry,
} from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type { AnalysisDistributorCheckFinishedPayload, AnalysisDistributorExecutionProgressPayload } from '@privateaim/server-core-worker-kit';
import { AnalysisDistributorEvent } from '@privateaim/server-core-worker-kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisDistributor } from '../../../../src/core/services/analysis-distributor/module.ts';
import { ANALYSIS_PROCESS_HEARTBEAT_STAMP_MS, ANALYSIS_PROCESS_STALE_THRESHOLD_MS } from '../../../../src/core/services/helpers.ts';
import { FakeEntityRepository } from '@privateaim/server-test-kit';
import { FakeAnalysisDistributorDispatcher } from './helpers/fake-distributor-dispatcher.ts';
import { FakeAnalysisRepository } from '../entities/analysis/fake-repository.ts';
import { FakeAnalysisMetadataRecalculator } from '../entities/analysis/fake-metadata-recalculator.ts';
import { FakeAnalysisNodeMetadataRecalculator } from '../entities/analysis-node/fake-metadata-recalculator.ts';
import { FakeAnalysisFileMetadataRecalculator } from '../entities/analysis-bucket-file/fake-metadata-recalculator.ts';
import { createFullAnalysis, createTestAnalysisNode } from '../../../utils/domains/index.ts';

function createTestRegistry(overrides?: Partial<Registry>): Registry {
    return {
        id: 'registry-1',
        name: 'test-registry',
        host: 'registry.example.com',
        accountName: 'admin',
        accountSecret: 'secret',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as Registry;
}

describe('AnalysisDistributor', () => {
    let repository: FakeAnalysisRepository;
    let analysisNodeRepository: FakeEntityRepository<AnalysisNode>;
    let registryRepository: FakeEntityRepository<Registry>;
    let dispatcher: FakeAnalysisDistributorDispatcher;
    let analysisRecalculator: FakeAnalysisMetadataRecalculator;
    let nodeRecalculator: FakeAnalysisNodeMetadataRecalculator;
    let fileRecalculator: FakeAnalysisFileMetadataRecalculator;
    let distributor: AnalysisDistributor;

    beforeEach(() => {
        repository = new FakeAnalysisRepository();
        analysisNodeRepository = new FakeEntityRepository<AnalysisNode>();
        registryRepository = new FakeEntityRepository<Registry>();
        dispatcher = new FakeAnalysisDistributorDispatcher();
        analysisRecalculator = new FakeAnalysisMetadataRecalculator(repository);
        nodeRecalculator = new FakeAnalysisNodeMetadataRecalculator(repository);
        fileRecalculator = new FakeAnalysisFileMetadataRecalculator(repository);
        distributor = new AnalysisDistributor({
            repository,
            analysisNodeRepository,
            registryRepository,
            dispatcher,
            analysisRecalculator,
            nodeRecalculator,
            fileRecalculator,
        });
    });

    function seedBuiltAnalysis(overrides?: Partial<Analysis>): Analysis {
        const analysis = createFullAnalysis({
            configurationLocked: true,
            buildStatus: ProcessStatus.EXECUTED,
            buildProgress: 100,
            buildHash: 'abc123',
            ...overrides,
        });

        repository.seed(analysis);

        return analysis;
    }

    describe('start', () => {
        it('should set distributionStatus to STARTING and dispatch execute', async () => {
            const analysis = seedBuiltAnalysis();

            registryRepository.seed(createTestRegistry());
            analysisNodeRepository.seed(createTestAnalysisNode({ analysisId: 'analysis-1' }));

            const result = await distributor.start(analysis);

            expect(result.distributionStatus).toBe(ProcessStatus.STARTING);
            expect(dispatcher.getCallsFor('dispatchExecute')).toHaveLength(1);
            expect(dispatcher.getCallsFor('dispatchExecute')[0].data.id).toBe('analysis-1');
        });

        it('should call recalculators before starting', async () => {
            const analysis = seedBuiltAnalysis();

            registryRepository.seed(createTestRegistry());
            analysisNodeRepository.seed(createTestAnalysisNode({ analysisId: 'analysis-1' }));

            await distributor.start(analysis);

            expect(analysisRecalculator.getCallCount()).toBeGreaterThanOrEqual(1);
            expect(nodeRecalculator.getCallCount()).toBeGreaterThanOrEqual(1);
            expect(fileRecalculator.getCallCount()).toBeGreaterThanOrEqual(1);
        });

        it('should resolve entity by string ID', async () => {
            seedBuiltAnalysis();
            registryRepository.seed(createTestRegistry());
            analysisNodeRepository.seed(createTestAnalysisNode({ analysisId: 'analysis-1' }));

            const result = await distributor.start('analysis-1');

            expect(result.distributionStatus).toBe(ProcessStatus.STARTING);
        });

        it('should auto-assign first registry when registryId is null', async () => {
            const analysis = seedBuiltAnalysis({ registryId: null });

            registryRepository.seed(createTestRegistry({ id: 'auto-registry' }));
            analysisNodeRepository.seed(createTestAnalysisNode({ analysisId: 'analysis-1' }));

            const result = await distributor.start(analysis);

            expect(result.registryId).toBe('auto-registry');
        });

        it('should throw when no registries exist and registryId is null', async () => {
            const analysis = seedBuiltAnalysis({ registryId: null });

            await expect(distributor.start(analysis)).rejects.toThrow(BadRequestError);
        });

        it('should throw when build not EXECUTED', async () => {
            const analysis = seedBuiltAnalysis({ buildStatus: ProcessStatus.STARTED });

            await expect(distributor.start(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should throw when not every node approved the built image', async () => {
            const analysis = seedBuiltAnalysis({ distributionNodesValid: false });

            registryRepository.seed(createTestRegistry());

            await expect(distributor.start(analysis)).rejects.toThrow(AnalysisError.nodesApprovalRequired().message);
            expect(dispatcher.getCallsFor('dispatchExecute')).toHaveLength(0);
        });

        it('should throw when distribution already in progress', async () => {
            const analysis = seedBuiltAnalysis({ distributionStatus: ProcessStatus.STARTING });

            await expect(distributor.start(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should re-check canStart on the locked row, so a concurrent start does not dispatch twice', async () => {
            const analysis = seedBuiltAnalysis();

            registryRepository.seed(createTestRegistry());
            analysisNodeRepository.seed(createTestAnalysisNode({ analysisId: 'analysis-1' }));

            // another replica's start commits between this start's early read and its lock
            repository.beforeLockedUpdate = async () => {
                await repository.save({ ...repository.getAll()[0], distributionStatus: ProcessStatus.STARTING });
            };

            await expect(distributor.start(analysis)).rejects.toThrow(AnalysisError);
            expect(dispatcher.getCallsFor('dispatchExecute')).toHaveLength(0);
        });

        it('should persist the auto-assigned registry with the STARTING transition', async () => {
            seedBuiltAnalysis({ registryId: null });
            registryRepository.seed(createTestRegistry({ id: 'auto-registry' }));
            analysisNodeRepository.seed(createTestAnalysisNode({ analysisId: 'analysis-1' }));

            await distributor.start('analysis-1');

            expect(await repository.findOneById('analysis-1')).toMatchObject({
                registryId: 'auto-registry',
                distributionStatus: ProcessStatus.STARTING,
            });
        });

        it('should allow retry when distribution FAILED', async () => {
            const analysis = seedBuiltAnalysis({ distributionStatus: ProcessStatus.FAILED });

            registryRepository.seed(createTestRegistry());
            analysisNodeRepository.seed(createTestAnalysisNode({ analysisId: 'analysis-1' }));

            const result = await distributor.start(analysis);

            expect(result.distributionStatus).toBe(ProcessStatus.STARTING);
        });

        it('should throw when a node has no registry assigned', async () => {
            const analysis = seedBuiltAnalysis();

            registryRepository.seed(createTestRegistry());
            analysisNodeRepository.seed(createTestAnalysisNode({
                analysisId: 'analysis-1',
                node: {
                    id: 'bad-node',
                    name: 'bad-node',
                    type: NodeType.DEFAULT,
                    registryId: null,
                } as unknown as Node,
            }));

            await expect(distributor.start(analysis)).rejects.toThrow(BadRequestError);
        });
    });

    describe('check', () => {
        it('should dispatch check call', async () => {
            const analysis = seedBuiltAnalysis({ distributionStatus: ProcessStatus.STARTED });

            const result = await distributor.check(analysis);

            expect(result.id).toBe('analysis-1');
            expect(dispatcher.getCallsFor('dispatchCheck')).toHaveLength(1);
        });

        it('should resolve entity by string ID', async () => {
            seedBuiltAnalysis({ distributionStatus: ProcessStatus.STARTED });

            const result = await distributor.check('analysis-1');

            expect(result.id).toBe('analysis-1');
        });

        it('should throw for missing entity', async () => {
            await expect(distributor.check('nonexistent')).rejects.toThrow(BadRequestError);
        });

        it('should throw when build not initialized', async () => {
            const analysis = seedBuiltAnalysis({ buildStatus: null });

            await expect(distributor.check(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should throw when build not EXECUTED', async () => {
            const analysis = seedBuiltAnalysis({ buildStatus: ProcessStatus.FAILED });

            await expect(distributor.check(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should throw when distribution not initialized', async () => {
            const analysis = seedBuiltAnalysis();

            await expect(distributor.check(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should dispatch check call for EXECUTED distribution (reconciliation after data loss)', async () => {
            const analysis = seedBuiltAnalysis({ distributionStatus: ProcessStatus.EXECUTED });

            const result = await distributor.check(analysis);

            expect(result.id).toBe('analysis-1');
            expect(dispatcher.getCallsFor('dispatchCheck')).toHaveLength(1);
        });
    });

    describe('applyEvent', () => {
        function createAnalysis(overrides: Partial<Analysis> = {}): Analysis {
            return repository.seed(createFullAnalysis(overrides));
        }

        async function findAnalysis(id: string): Promise<Analysis> {
            return repository.findOneById(id);
        }

        it('should ignore a late EXECUTION_PROGRESS for an executed distribution', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.EXECUTED,
                distributionProgress: 100,
            });

            const payload: AnalysisDistributorExecutionProgressPayload = {
                id: analysis.id,
                progress: {
                    current: 1,
                    total: 1,
                    percent: 40,
                },
            };
            const saved = await distributor.applyEvent(AnalysisDistributorEvent.EXECUTION_PROGRESS, payload);

            expect(saved).toBeNull();
            expect(await findAnalysis(analysis.id)).toMatchObject({
                distributionStatus: ProcessStatus.EXECUTED,
                distributionProgress: 100,
            });
        });

        it('should mark the distribution as EXECUTED on CHECK_FINISHED with status EXECUTED', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTED,
                distributionProgress: 40,
            });

            const payload: AnalysisDistributorCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.EXECUTED,
            };

            await distributor.applyEvent(AnalysisDistributorEvent.CHECK_FINISHED, payload);

            const entity = await findAnalysis(analysis.id);

            expect(entity.distributionStatus).toBe(ProcessStatus.EXECUTED);
            expect(entity.distributionProgress).toBe(100);
        });

        it('should mark the distribution as FAILED on CHECK_FINISHED with status FAILED', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTED,
                distributionProgress: 40,
            });

            const payload: AnalysisDistributorCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.FAILED,
            };

            await distributor.applyEvent(AnalysisDistributorEvent.CHECK_FINISHED, payload);

            const entity = await findAnalysis(analysis.id);

            expect(entity.distributionStatus).toBe(ProcessStatus.FAILED);
            expect(entity.distributionProgress).toBe(0);
        });

        it('should keep progress on CHECK_FINISHED with in-progress status', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTED,
                distributionProgress: 40,
            });

            const payload: AnalysisDistributorCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.STARTED,
            };

            await distributor.applyEvent(AnalysisDistributorEvent.CHECK_FINISHED, payload);

            const entity = await findAnalysis(analysis.id);

            expect(entity.distributionStatus).toBe(ProcessStatus.STARTED);
            expect(entity.distributionProgress).toBe(40);
        });

        it('should FAIL a stale in-progress distribution on CHECK_FINISHED with an in-progress status', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTING,
                distributionProgress: 40,
                updatedAt: new Date(Date.now() - ANALYSIS_PROCESS_STALE_THRESHOLD_MS - 1000).toISOString(),
            });

            const payload: AnalysisDistributorCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.STARTING,
            };

            await distributor.applyEvent(AnalysisDistributorEvent.CHECK_FINISHED, payload);

            const entity = await findAnalysis(analysis.id);

            expect(entity.distributionStatus).toBe(ProcessStatus.FAILED);
            expect(entity.distributionProgress).toBe(0);
        });

        it('should stamp updatedAt on EXECUTION_PROGRESS even when the percent is unchanged', async () => {
            const updatedAt = new Date(Date.now() - 2 * ANALYSIS_PROCESS_HEARTBEAT_STAMP_MS).toISOString();
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTED,
                distributionProgress: 40,
                updatedAt,
            });

            const payload: AnalysisDistributorExecutionProgressPayload = {
                id: analysis.id,
                progress: {
                    current: 0,
                    total: 0,
                    percent: 40,
                },
            };

            await distributor.applyEvent(AnalysisDistributorEvent.EXECUTION_PROGRESS, payload);

            const entity = await findAnalysis(analysis.id);

            expect(entity.distributionProgress).toBe(40);
            expect(new Date(entity.updatedAt).getTime()).toBeGreaterThan(new Date(updatedAt).getTime());
        });

        it('should not save an unchanged EXECUTION_PROGRESS on a recently written row', async () => {
            const updatedAt = new Date(Date.now() - 1000).toISOString();
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTED,
                distributionProgress: 40,
                updatedAt,
            });

            const payload: AnalysisDistributorExecutionProgressPayload = {
                id: analysis.id,
                progress: {
                    current: 0,
                    total: 0,
                    percent: 40,
                },
            };
            const saved = await distributor.applyEvent(AnalysisDistributorEvent.EXECUTION_PROGRESS, payload);

            expect(saved).toBeNull();
            expect(await findAnalysis(analysis.id)).toMatchObject({ distributionProgress: 40, updatedAt });
        });

        it.each([
            [AnalysisDistributorEvent.EXECUTION_STARTED, null],
            [AnalysisDistributorEvent.EXECUTION_PROGRESS, null],
            [AnalysisDistributorEvent.EXECUTION_FAILED, null],
            [AnalysisDistributorEvent.EXECUTION_FAILED, ProcessStatus.EXECUTED],
        ])('should ignore a late %s on a %s distribution', async (event, status) => {
            // e.g. a stale run declared FAILED, then unlocked (null), whose
            // retried EXECUTE still runs — it must not wedge the analysis.
            const analysis = await createAnalysis({ distributionStatus: status });

            const payload: AnalysisDistributorExecutionProgressPayload = {
                id: analysis.id,
                progress: {
                    current: 0,
                    total: 0,
                    percent: 10,
                },
            };
            const saved = await distributor.applyEvent(event, payload);

            expect(saved).toBeNull();
            expect(await findAnalysis(analysis.id)).toMatchObject({ distributionStatus: status });
        });

        it.each([ProcessStatus.FAILED, null])('should not resurrect a %s distribution on a late EXECUTION_FINISHED', async (status) => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: status,
                distributionProgress: 0,
            });

            const saved = await distributor.applyEvent(AnalysisDistributorEvent.EXECUTION_FINISHED, { id: analysis.id });

            expect(saved).toBeNull();
            expect(await findAnalysis(analysis.id)).toMatchObject({ distributionStatus: status, distributionProgress: 0 });
        });

        it('should mark an in-progress distribution as EXECUTED on EXECUTION_FINISHED', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTED,
                distributionProgress: 40,
            });

            await distributor.applyEvent(AnalysisDistributorEvent.EXECUTION_FINISHED, { id: analysis.id });

            expect(await findAnalysis(analysis.id)).toMatchObject({ distributionStatus: ProcessStatus.EXECUTED, distributionProgress: 100 });
        });

        it('should not modify the entity on CHECK_FINISHED without status', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTING,
            });

            const payload: AnalysisDistributorCheckFinishedPayload = { id: analysis.id };

            await distributor.applyEvent(AnalysisDistributorEvent.CHECK_FINISHED, payload);

            const entity = await findAnalysis(analysis.id);

            expect(entity.distributionStatus).toBe(ProcessStatus.STARTING);
        });

        it('should not mark the distribution as FAILED on CHECK_FAILED', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTED,
                distributionProgress: 40,
            });

            await distributor.applyEvent(AnalysisDistributorEvent.CHECK_FAILED, { id: analysis.id });

            const entity = await findAnalysis(analysis.id);

            expect(entity.distributionStatus).toBe(ProcessStatus.STARTED);
            expect(entity.distributionProgress).toBe(40);
        });

        it('should mark the distribution as FAILED on EXECUTION_FAILED', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTED,
            });

            await distributor.applyEvent(AnalysisDistributorEvent.EXECUTION_FAILED, { id: analysis.id });

            const entity = await findAnalysis(analysis.id);

            expect(entity.distributionStatus).toBe(ProcessStatus.FAILED);
        });
    });
});
