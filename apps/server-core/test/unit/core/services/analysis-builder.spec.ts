/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EntityNotFoundError } from '@privateaim/errors';
import type { Analysis } from '@privateaim/core-kit';
import {
    AnalysisBuilderCommandChecker,
    AnalysisError,
    AnalysisNodeApprovalStatus,
    NodeType,
} from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type { AnalysisBuilderCheckFinishedPayload, AnalysisBuilderExecutionProgressPayload } from '@privateaim/server-core-worker-kit';
import { AnalysisBuilderEvent } from '@privateaim/server-core-worker-kit';
import { 
    beforeEach, 
    describe, 
    expect, 
    it, 
} from 'vitest';
import { AnalysisBuilder } from '../../../../src/core/services/analysis-builder/module.ts';
import { ANALYSIS_PROCESS_HEARTBEAT_STAMP_MS, ANALYSIS_PROCESS_STALE_THRESHOLD_MS } from '../../../../src/core/services/helpers.ts';
import { FakeAnalysisBuilderCaller } from './helpers/fake-builder-caller.ts';
import { FakeAnalysisRepository } from '../entities/analysis/fake-repository.ts';
import { FakeAnalysisMetadataRecalculator } from '../entities/analysis/fake-metadata-recalculator.ts';
import { FakeAnalysisNodeMetadataRecalculator } from '../entities/analysis-node/fake-metadata-recalculator.ts';
import { FakeAnalysisNodeRepository } from '../entities/analysis-node/fake-repository.ts';
import { FakeAnalysisFileMetadataRecalculator } from '../entities/analysis-bucket-file/fake-metadata-recalculator.ts';
import { createFullAnalysis, createTestAnalysisNode } from '../../../utils/domains/index.ts';

describe('AnalysisBuilder', () => {
    let repository: FakeAnalysisRepository;
    let analysisNodeRepository: FakeAnalysisNodeRepository;
    let caller: FakeAnalysisBuilderCaller;
    let analysisRecalculator: FakeAnalysisMetadataRecalculator;
    let nodeRecalculator: FakeAnalysisNodeMetadataRecalculator;
    let fileRecalculator: FakeAnalysisFileMetadataRecalculator;
    let builder: AnalysisBuilder;

    beforeEach(() => {
        repository = new FakeAnalysisRepository();
        analysisNodeRepository = new FakeAnalysisNodeRepository();
        analysisRecalculator = new FakeAnalysisMetadataRecalculator(repository);
        nodeRecalculator = new FakeAnalysisNodeMetadataRecalculator(repository);
        fileRecalculator = new FakeAnalysisFileMetadataRecalculator(repository);
        caller = new FakeAnalysisBuilderCaller();
        builder = new AnalysisBuilder({
            repository,
            analysisNodeRepository,
            caller,
            analysisRecalculator,
            nodeRecalculator,
            fileRecalculator,
        });
    });

    describe('start', () => {
        it('should set buildStatus to STARTING and dispatch execute', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true });
            repository.seed(analysis);

            const result = await builder.start(analysis);

            expect(result.buildStatus).toBe(ProcessStatus.STARTING);
            expect(result.buildProgress).toBeNull();
            expect(caller.getCallsFor('callExecute')).toHaveLength(1);
            expect(caller.getCallsFor('callExecute')[0].data.id).toBe('analysis-1');
        });

        it('should call all recalculators before checking', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true });
            repository.seed(analysis);

            await builder.start(analysis);

            expect(analysisRecalculator.getCallCount()).toBe(1);
            // once before the check, once after the approval reset
            expect(nodeRecalculator.getCallCount()).toBe(2);
            expect(fileRecalculator.getCallCount()).toBe(1);
        });

        it('should resolve entity by string ID', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true });
            repository.seed(analysis);

            const result = await builder.start('analysis-1');

            expect(result.buildStatus).toBe(ProcessStatus.STARTING);
            expect(caller.getCallCount()).toBe(1);
        });

        it('should save entity to repository', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true });
            repository.seed(analysis);

            await builder.start(analysis);

            const saved = await repository.findOneById('analysis-1');
            expect(saved).toBeDefined();
            expect(saved!.buildStatus).toBe(ProcessStatus.STARTING);
        });

        it('should throw when config not locked', async () => {
            const analysis = createFullAnalysis({ configurationLocked: false });
            repository.seed(analysis);

            await expect(builder.start(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should start without node approval (approval gates distribution)', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true, distributionNodesValid: false });
            repository.seed(analysis);

            const result = await builder.start(analysis);

            expect(result.buildStatus).toBe(ProcessStatus.STARTING);
        });

        it('should reset every non-aggregator approval, so nodes approve the new image', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.FAILED });
            repository.seed(analysis);

            const defaultNode = createTestAnalysisNode({
                id: 'an-default',
                approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
            });
            const aggregatorNode = createTestAnalysisNode({
                id: 'an-aggregator',
                nodeId: 'node-aggregator',
                approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
                node: {
                    ...defaultNode.node,
                    id: 'node-aggregator',
                    type: NodeType.AGGREGATOR,
                },
            });
            analysisNodeRepository.seed([defaultNode, aggregatorNode]);

            await builder.start(analysis);

            expect((await analysisNodeRepository.findOneById('an-default'))!.approvalStatus).toBeNull();
            expect((await analysisNodeRepository.findOneById('an-aggregator'))!.approvalStatus)
                .toBe(AnalysisNodeApprovalStatus.APPROVED);
            // the reset is reflected in the aggregates before the build is dispatched
            expect(nodeRecalculator.getCallCount()).toBe(2);
        });

        it('should keep approvals when approval is ignored', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true });
            repository.seed(analysis);
            analysisNodeRepository.seed(createTestAnalysisNode({
                id: 'an-default',
                approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
            }));

            await builder.start(analysis, { ignoreApproval: true });

            expect((await analysisNodeRepository.findOneById('an-default'))!.approvalStatus)
                .toBe(AnalysisNodeApprovalStatus.APPROVED);
        });

        it('should keep approvals when the build cannot start', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STARTED });
            repository.seed(analysis);
            analysisNodeRepository.seed(createTestAnalysisNode({
                id: 'an-default',
                approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
            }));

            await expect(builder.start(analysis)).rejects.toThrow(AnalysisError);

            expect((await analysisNodeRepository.findOneById('an-default'))!.approvalStatus)
                .toBe(AnalysisNodeApprovalStatus.APPROVED);
        });

        it('should allow retry when build FAILED', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.FAILED });
            repository.seed(analysis);

            const result = await builder.start(analysis);
            expect(result.buildStatus).toBe(ProcessStatus.STARTING);
        });

        it('should re-check canStart on the locked row, so a concurrent start does not dispatch twice', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true });
            repository.seed(analysis);

            // another replica's start commits between this start's early read and its lock
            repository.beforeLockedUpdate = async () => {
                await repository.save({ ...repository.getAll()[0], buildStatus: ProcessStatus.STARTING });
            };

            await expect(builder.start(analysis)).rejects.toThrow(AnalysisError);
            expect(caller.getCallsFor('callExecute')).toHaveLength(0);
        });

        it('should throw when build already in progress', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STARTING });
            repository.seed(analysis);

            await expect(builder.start(analysis)).rejects.toThrow(AnalysisError);
        });
    });

    describe('check', () => {
        it('should dispatch check call for in-progress build', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STARTED });
            repository.seed(analysis);

            const result = await builder.check(analysis);

            expect(result.id).toBe('analysis-1');
            expect(caller.getCallsFor('callCheck')).toHaveLength(1);
            expect(caller.getCallsFor('callCheck')[0].data.id).toBe('analysis-1');
        });

        it('should resolve entity by string ID', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.STARTED });
            repository.seed(analysis);

            const result = await builder.check('analysis-1');
            expect(result.id).toBe('analysis-1');
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(builder.check('nonexistent')).rejects.toThrow(EntityNotFoundError);
        });

        it('should throw when config not locked', async () => {
            const analysis = createFullAnalysis({ configurationLocked: false, buildStatus: ProcessStatus.STARTED });
            repository.seed(analysis);

            await expect(builder.check(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should throw when no build started', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true, buildStatus: null });
            repository.seed(analysis);

            await expect(builder.check(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should dispatch check call for EXECUTED build (reconciliation after data loss)', async () => {
            const analysis = createFullAnalysis({ configurationLocked: true, buildStatus: ProcessStatus.EXECUTED });
            repository.seed(analysis);

            const result = await builder.check(analysis);

            expect(result.id).toBe('analysis-1');
            expect(caller.getCallsFor('callCheck')).toHaveLength(1);
        });
    });

    describe('applyEvent', () => {
        function createAnalysis(overrides: Partial<Analysis> = {}): Analysis {
            return repository.seed(createFullAnalysis(overrides));
        }

        async function findAnalysis(id: string): Promise<Analysis> {
            return repository.findOneById(id);
        }

        it('should ignore a late EXECUTION_PROGRESS for an executed build', async () => {
            const analysis = await createAnalysis({ buildStatus: ProcessStatus.EXECUTED, buildProgress: 100 });

            const payload: AnalysisBuilderExecutionProgressPayload = {
                id: analysis.id,
                progress: {
                    current: 1, 
                    total: 1, 
                    percent: 40, 
                },
            };
            const saved = await builder.applyEvent(AnalysisBuilderEvent.EXECUTION_PROGRESS, payload);

            expect(saved).toBeNull();
            expect(await findAnalysis(analysis.id)).toMatchObject({ buildStatus: ProcessStatus.EXECUTED, buildProgress: 100 });
        });

        it('should apply build metadata on CHECK_FINISHED with status EXECUTED', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.STARTED,
                buildProgress: 40,
            });

            const payload: AnalysisBuilderCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.EXECUTED,
                hash: 'sha256:abc',
                os: 'linux',
                size: 1024,
            };

            await builder.applyEvent(AnalysisBuilderEvent.CHECK_FINISHED, payload);

            const entity = await findAnalysis(analysis.id);
            expect(entity.buildStatus).toBe(ProcessStatus.EXECUTED);
            expect(entity.buildProgress).toBe(100);
            expect(entity.buildHash).toBe('sha256:abc');
            expect(entity.buildOs).toBe('linux');
            expect(entity.buildSize).toBe(1024);
        });

        it('should keep build metadata and progress on CHECK_FINISHED with in-progress status', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.STARTED,
                buildProgress: 40,
                buildHash: 'sha256:previous',
                buildOs: 'linux',
                buildSize: 512,
            });

            const payload: AnalysisBuilderCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.STARTED,
            };

            await builder.applyEvent(AnalysisBuilderEvent.CHECK_FINISHED, payload);

            const entity = await findAnalysis(analysis.id);
            expect(entity.buildStatus).toBe(ProcessStatus.STARTED);
            expect(entity.buildProgress).toBe(40);
            expect(entity.buildHash).toBe('sha256:previous');
            expect(entity.buildOs).toBe('linux');
            expect(entity.buildSize).toBe(512);
        });

        it('should FAIL a stale in-progress build on CHECK_FINISHED with an in-progress status', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.STARTED,
                buildProgress: 40,
                buildHash: 'sha256:previous',
                updatedAt: new Date(Date.now() - ANALYSIS_PROCESS_STALE_THRESHOLD_MS - 1000).toISOString(),
            });

            const payload: AnalysisBuilderCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.STARTED,
            };

            await builder.applyEvent(AnalysisBuilderEvent.CHECK_FINISHED, payload);

            const entity = await findAnalysis(analysis.id);
            expect(entity.buildStatus).toBe(ProcessStatus.FAILED);
            expect(entity.buildProgress).toBe(0);
            expect(entity.buildHash).toBeNull();
        });

        it('should stamp updatedAt on EXECUTION_PROGRESS even when the percent is unchanged', async () => {
            const updatedAt = new Date(Date.now() - 2 * ANALYSIS_PROCESS_HEARTBEAT_STAMP_MS).toISOString();
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.STARTED,
                buildProgress: 40,
                updatedAt,
            });

            const payload: AnalysisBuilderExecutionProgressPayload = {
                id: analysis.id,
                progress: {
                    current: 0,
                    total: 0,
                    percent: 40,
                },
            };
            await builder.applyEvent(AnalysisBuilderEvent.EXECUTION_PROGRESS, payload);

            const entity = await findAnalysis(analysis.id);
            expect(entity.buildProgress).toBe(40);
            expect(new Date(entity.updatedAt).getTime()).toBeGreaterThan(new Date(updatedAt).getTime());
        });

        it('should reset build artifacts on CHECK_FINISHED with status FAILED (data loss recovery)', async () => {
            const analysis = await createAnalysis({
                configurationLocked: true,
                distributionNodesValid: true,
                buildStatus: ProcessStatus.EXECUTED,
                buildProgress: 100,
                buildHash: 'sha256:lost',
                buildOs: 'linux',
                buildSize: 512,
            });

            const payload: AnalysisBuilderCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.FAILED,
            };

            await builder.applyEvent(AnalysisBuilderEvent.CHECK_FINISHED, payload);

            const entity = await findAnalysis(analysis.id);
            expect(entity.buildStatus).toBe(ProcessStatus.FAILED);
            expect(entity.buildProgress).toBe(0);
            expect(entity.buildHash).toBeNull();
            expect(entity.buildOs).toBeNull();
            expect(entity.buildSize).toBeNull();

            // the analysis must be rebuildable again after the reset
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).not.toThrow();
        });

        it('should not save an unchanged EXECUTION_PROGRESS on a recently written row', async () => {
            const updatedAt = new Date(Date.now() - 1000).toISOString();
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.STARTED,
                buildProgress: 40,
                updatedAt,
            });

            const payload: AnalysisBuilderExecutionProgressPayload = {
                id: analysis.id,
                progress: {
                    current: 0,
                    total: 0,
                    percent: 40,
                },
            };
            const saved = await builder.applyEvent(AnalysisBuilderEvent.EXECUTION_PROGRESS, payload);

            expect(saved).toBeNull();
            expect(await findAnalysis(analysis.id)).toMatchObject({ buildProgress: 40, updatedAt });
        });

        it.each([ProcessStatus.FAILED, null])('should not resurrect a %s build on a late EXECUTION_FINISHED', async (status) => {
            const analysis = await createAnalysis({
                buildStatus: status,
                buildProgress: 0,
            });

            const saved = await builder.applyEvent(AnalysisBuilderEvent.EXECUTION_FINISHED, { id: analysis.id });

            expect(saved).toBeNull();
            expect(await findAnalysis(analysis.id)).toMatchObject({ buildStatus: status, buildProgress: 0 });
        });

        it('should mark an in-progress build as EXECUTED on EXECUTION_FINISHED', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.STARTED,
                buildProgress: 40,
            });

            await builder.applyEvent(AnalysisBuilderEvent.EXECUTION_FINISHED, { id: analysis.id });

            expect(await findAnalysis(analysis.id)).toMatchObject({ buildStatus: ProcessStatus.EXECUTED, buildProgress: 100 });
        });

        it('should not modify the entity on CHECK_FINISHED without status', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.STARTING,
                buildHash: 'sha256:previous',
            });

            const payload: AnalysisBuilderCheckFinishedPayload = { id: analysis.id };

            await builder.applyEvent(AnalysisBuilderEvent.CHECK_FINISHED, payload);

            const entity = await findAnalysis(analysis.id);
            expect(entity.buildStatus).toBe(ProcessStatus.STARTING);
            expect(entity.buildHash).toBe('sha256:previous');
        });

        it('should not mark the build as FAILED on CHECK_FAILED', async () => {
            const analysis = await createAnalysis({
                buildStatus: ProcessStatus.STARTED,
                buildProgress: 40,
            });

            await builder.applyEvent(AnalysisBuilderEvent.CHECK_FAILED, { id: analysis.id });

            const entity = await findAnalysis(analysis.id);
            expect(entity.buildStatus).toBe(ProcessStatus.STARTED);
            expect(entity.buildProgress).toBe(40);
        });

        it('should mark the build as FAILED on EXECUTION_FAILED', async () => {
            const analysis = await createAnalysis({ buildStatus: ProcessStatus.STARTED });

            await builder.applyEvent(AnalysisBuilderEvent.EXECUTION_FAILED, { id: analysis.id });

            const entity = await findAnalysis(analysis.id);
            expect(entity.buildStatus).toBe(ProcessStatus.FAILED);
        });
    });
});
