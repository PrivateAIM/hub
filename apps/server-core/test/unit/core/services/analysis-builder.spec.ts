/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EntityNotFoundError } from '@privateaim/errors';
import type { Analysis } from '@privateaim/core-kit';
import { AnalysisError, AnalysisNodeApprovalStatus, NodeType } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { 
    beforeEach, 
    describe, 
    expect, 
    it, 
} from 'vitest';
import { AnalysisBuilder } from '../../../../src/core/services/analysis-builder/module.ts';
import { FakeEntityRepository } from '../helpers/index.ts';
import { FakeAnalysisBuilderCaller } from './helpers/fake-builder-caller.ts';
import { FakeAnalysisMetadataRecalculator } from '../entities/analysis/fake-metadata-recalculator.ts';
import { FakeAnalysisNodeMetadataRecalculator } from '../entities/analysis-node/fake-metadata-recalculator.ts';
import { FakeAnalysisNodeRepository } from '../entities/analysis-node/fake-repository.ts';
import { FakeAnalysisFileMetadataRecalculator } from '../entities/analysis-bucket-file/fake-metadata-recalculator.ts';
import { createFullAnalysis, createTestAnalysisNode } from '../../../utils/domains/index.ts';

describe('AnalysisBuilder', () => {
    let repository: FakeEntityRepository<Analysis>;
    let analysisNodeRepository: FakeAnalysisNodeRepository;
    let caller: FakeAnalysisBuilderCaller;
    let analysisRecalculator: FakeAnalysisMetadataRecalculator;
    let nodeRecalculator: FakeAnalysisNodeMetadataRecalculator;
    let fileRecalculator: FakeAnalysisFileMetadataRecalculator;
    let builder: AnalysisBuilder;

    beforeEach(() => {
        repository = new FakeEntityRepository<Analysis>();
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
});
