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
import { 
    beforeEach, 
    describe, 
    expect, 
    it, 
} from 'vitest';
import { AnalysisDistributor } from '../../../../src/core/services/analysis-distributor/module.ts';
import { FakeEntityRepository } from '../helpers/index.ts';
import { FakeAnalysisDistributorCaller } from './helpers/fake-distributor-caller.ts';
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
    let repository: FakeEntityRepository<Analysis>;
    let analysisNodeRepository: FakeEntityRepository<AnalysisNode>;
    let registryRepository: FakeEntityRepository<Registry>;
    let caller: FakeAnalysisDistributorCaller;
    let analysisRecalculator: FakeAnalysisMetadataRecalculator;
    let nodeRecalculator: FakeAnalysisNodeMetadataRecalculator;
    let fileRecalculator: FakeAnalysisFileMetadataRecalculator;
    let distributor: AnalysisDistributor;

    beforeEach(() => {
        repository = new FakeEntityRepository<Analysis>();
        analysisNodeRepository = new FakeEntityRepository<AnalysisNode>();
        registryRepository = new FakeEntityRepository<Registry>();
        caller = new FakeAnalysisDistributorCaller();
        analysisRecalculator = new FakeAnalysisMetadataRecalculator(repository);
        nodeRecalculator = new FakeAnalysisNodeMetadataRecalculator(repository);
        fileRecalculator = new FakeAnalysisFileMetadataRecalculator(repository);
        distributor = new AnalysisDistributor({
            repository,
            analysisNodeRepository,
            registryRepository,
            caller,
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
            expect(caller.getCallsFor('callExecute')).toHaveLength(1);
            expect(caller.getCallsFor('callExecute')[0].data.id).toBe('analysis-1');
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
            const analysis = seedBuiltAnalysis({ registryId: null as unknown as string });
            registryRepository.seed(createTestRegistry({ id: 'auto-registry' }));
            analysisNodeRepository.seed(createTestAnalysisNode({ analysisId: 'analysis-1' }));

            const result = await distributor.start(analysis);
            expect(result.registryId).toBe('auto-registry');
        });

        it('should throw when no registries exist and registryId is null', async () => {
            const analysis = seedBuiltAnalysis({ registryId: null as unknown as string });

            await expect(distributor.start(analysis)).rejects.toThrow(BadRequestError);
        });

        it('should throw when build not EXECUTED', async () => {
            const analysis = seedBuiltAnalysis({ buildStatus: ProcessStatus.STARTED });

            await expect(distributor.start(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should throw when distribution already in progress', async () => {
            const analysis = seedBuiltAnalysis({ distributionStatus: ProcessStatus.STARTING });

            await expect(distributor.start(analysis)).rejects.toThrow(AnalysisError);
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
            expect(caller.getCallsFor('callCheck')).toHaveLength(1);
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
            expect(caller.getCallsFor('callCheck')).toHaveLength(1);
        });
    });
});
