/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import type { Analysis, AnalysisNode } from '@privateaim/core-kit';
import { AnalysisError, AnalysisNodeApprovalStatus, NodeType } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { 
    beforeEach, 
    describe, 
    expect, 
    it, 
} from 'vitest';
import { AnalysisConfigurator } from '../../../../src/core/services/analysis-configurator/module.ts';
import {
    FakeAnalysisFileMetadataRecalculator,
    FakeAnalysisMetadataRecalculator,
    FakeAnalysisNodeMetadataRecalculator,
    FakeEntityRepository,
} from '../helpers/index.ts';
import { createFullAnalysis, createTestAnalysisNode } from '../../../utils/domains/index.ts';

describe('AnalysisConfigurator', () => {
    let repository: FakeEntityRepository<Analysis>;
    let analysisNodeRepository: FakeEntityRepository<AnalysisNode>;
    let analysisRecalculator: FakeAnalysisMetadataRecalculator;
    let nodeRecalculator: FakeAnalysisNodeMetadataRecalculator;
    let fileRecalculator: FakeAnalysisFileMetadataRecalculator;
    let configurator: AnalysisConfigurator;

    beforeEach(() => {
        repository = new FakeEntityRepository<Analysis>();
        analysisNodeRepository = new FakeEntityRepository<AnalysisNode>();
        analysisRecalculator = new FakeAnalysisMetadataRecalculator(repository);
        nodeRecalculator = new FakeAnalysisNodeMetadataRecalculator(repository);
        fileRecalculator = new FakeAnalysisFileMetadataRecalculator(repository);
        configurator = new AnalysisConfigurator({
            repository,
            analysisNodeRepository,
            analysisRecalculator,
            nodeRecalculator,
            fileRecalculator,
        });
    });

    describe('lock', () => {
        it('should set configuration_locked to true', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            const result = await configurator.lock(analysis);

            expect(result.configuration_locked).toBe(true);
        });

        it('should call recalculators before locking', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            await configurator.lock(analysis);

            expect(analysisRecalculator.getCallCount()).toBeGreaterThanOrEqual(1);
            expect(nodeRecalculator.getCallCount()).toBeGreaterThanOrEqual(1);
            expect(fileRecalculator.getCallCount()).toBeGreaterThanOrEqual(1);
        });

        it('should resolve entity by string ID', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            const result = await configurator.lock('analysis-1');
            expect(result.configuration_locked).toBe(true);
        });

        it('should save entity to repository', async () => {
            const analysis = createFullAnalysis();
            repository.seed(analysis);

            await configurator.lock(analysis);

            const saved = await repository.findOneById('analysis-1');
            expect(saved!.configuration_locked).toBe(true);
        });

        it('should throw when already locked', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true });
            repository.seed(analysis);

            await expect(configurator.lock(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should throw when build already initialized', async () => {
            const analysis = createFullAnalysis({ build_status: ProcessStatus.STARTING });
            repository.seed(analysis);

            await expect(configurator.lock(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should throw when default node invalid', async () => {
            const analysis = createFullAnalysis({ configuration_node_default_valid: false });
            repository.seed(analysis);

            await expect(configurator.lock(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should throw when entrypoint invalid', async () => {
            const analysis = createFullAnalysis({ configuration_entrypoint_valid: false });
            repository.seed(analysis);

            await expect(configurator.lock(analysis)).rejects.toThrow(AnalysisError);
        });
    });

    describe('unlock', () => {
        it('should set configuration_locked to false and clear build_status', async () => {
            const analysis = createFullAnalysis({
                configuration_locked: true,
                build_status: ProcessStatus.FAILED,
            });
            repository.seed(analysis);

            const result = await configurator.unlock(analysis);

            expect(result.configuration_locked).toBe(false);
            expect(result.build_status).toBeNull();
        });

        it('should resolve entity by string ID', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true });
            repository.seed(analysis);

            const result = await configurator.unlock('analysis-1');
            expect(result.configuration_locked).toBe(false);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(configurator.unlock('nonexistent')).rejects.toThrow(NotFoundError);
        });

        it('should throw when not locked', async () => {
            const analysis = createFullAnalysis({ configuration_locked: false });
            repository.seed(analysis);

            await expect(configurator.unlock(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should throw when build in progress (STARTING)', async () => {
            const analysis = createFullAnalysis({
                configuration_locked: true,
                build_status: ProcessStatus.STARTING,
            });
            repository.seed(analysis);

            await expect(configurator.unlock(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should reset approval_status on non-aggregator nodes', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true });
            repository.seed(analysis);

            const defaultNode = createTestAnalysisNode({
                id: 'an-default',
                analysis_id: 'analysis-1',
                approval_status: AnalysisNodeApprovalStatus.APPROVED,
                node: {
                    id: 'node-default',
                    name: 'default-node',
                    type: NodeType.DEFAULT,
                    registry_id: 'registry-1',
                } as AnalysisNode['node'],
            });
            const aggregatorNode = createTestAnalysisNode({
                id: 'an-aggregator',
                analysis_id: 'analysis-1',
                approval_status: AnalysisNodeApprovalStatus.APPROVED,
                node: {
                    id: 'node-aggregator',
                    name: 'aggregator-node',
                    type: NodeType.AGGREGATOR,
                    registry_id: 'registry-1',
                } as AnalysisNode['node'],
            });
            analysisNodeRepository.seed([defaultNode, aggregatorNode]);

            await configurator.unlock(analysis);

            const savedDefault = await analysisNodeRepository.findOneById('an-default');
            const savedAggregator = await analysisNodeRepository.findOneById('an-aggregator');
            expect(savedDefault!.approval_status).toBeNull();
            expect(savedAggregator!.approval_status).toBe(AnalysisNodeApprovalStatus.APPROVED);
        });

        it('should skip approval reset when ignoreApproval is true', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true });
            repository.seed(analysis);

            const defaultNode = createTestAnalysisNode({
                id: 'an-default',
                analysis_id: 'analysis-1',
                approval_status: AnalysisNodeApprovalStatus.APPROVED,
            });
            analysisNodeRepository.seed(defaultNode);

            await configurator.unlock(analysis, { ignoreApproval: true });

            const saved = await analysisNodeRepository.findOneById('an-default');
            expect(saved!.approval_status).toBe(AnalysisNodeApprovalStatus.APPROVED);
        });
    });
});
