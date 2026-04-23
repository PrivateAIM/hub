/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
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
import {
    FakeAnalysisDistributorCaller,
    FakeAnalysisFileMetadataRecalculator,
    FakeAnalysisMetadataRecalculator,
    FakeAnalysisNodeMetadataRecalculator,
    FakeEntityRepository,
} from '../helpers/index.ts';
import { createFullAnalysis, createTestAnalysisNode } from '../../../utils/domains/index.ts';

function createTestRegistry(overrides?: Partial<Registry>): Registry {
    return {
        id: 'registry-1',
        name: 'test-registry',
        host: 'registry.example.com',
        account_name: 'admin',
        account_secret: 'secret',
        created_at: new Date(),
        updated_at: new Date(),
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
            configuration_locked: true,
            build_status: ProcessStatus.EXECUTED,
            build_progress: 100,
            build_hash: 'abc123',
            ...overrides,
        });
        repository.seed(analysis);
        return analysis;
    }

    describe('start', () => {
        it('should set distribution_status to STARTING and dispatch execute', async () => {
            const analysis = seedBuiltAnalysis();
            registryRepository.seed(createTestRegistry());
            analysisNodeRepository.seed(createTestAnalysisNode({ analysis_id: 'analysis-1' }));

            const result = await distributor.start(analysis);

            expect(result.distribution_status).toBe(ProcessStatus.STARTING);
            expect(caller.getCallsFor('callExecute')).toHaveLength(1);
            expect(caller.getCallsFor('callExecute')[0].data.id).toBe('analysis-1');
        });

        it('should call recalculators before starting', async () => {
            const analysis = seedBuiltAnalysis();
            registryRepository.seed(createTestRegistry());
            analysisNodeRepository.seed(createTestAnalysisNode({ analysis_id: 'analysis-1' }));

            await distributor.start(analysis);

            expect(analysisRecalculator.getCallCount()).toBeGreaterThanOrEqual(1);
            expect(nodeRecalculator.getCallCount()).toBeGreaterThanOrEqual(1);
            expect(fileRecalculator.getCallCount()).toBeGreaterThanOrEqual(1);
        });

        it('should resolve entity by string ID', async () => {
            seedBuiltAnalysis();
            registryRepository.seed(createTestRegistry());
            analysisNodeRepository.seed(createTestAnalysisNode({ analysis_id: 'analysis-1' }));

            const result = await distributor.start('analysis-1');
            expect(result.distribution_status).toBe(ProcessStatus.STARTING);
        });

        it('should auto-assign first registry when registry_id is null', async () => {
            const analysis = seedBuiltAnalysis({ registry_id: null as unknown as string });
            registryRepository.seed(createTestRegistry({ id: 'auto-registry' }));
            analysisNodeRepository.seed(createTestAnalysisNode({ analysis_id: 'analysis-1' }));

            const result = await distributor.start(analysis);
            expect(result.registry_id).toBe('auto-registry');
        });

        it('should throw when no registries exist and registry_id is null', async () => {
            const analysis = seedBuiltAnalysis({ registry_id: null as unknown as string });

            await expect(distributor.start(analysis)).rejects.toThrow(BadRequestError);
        });

        it('should throw when build not EXECUTED', async () => {
            const analysis = seedBuiltAnalysis({ build_status: ProcessStatus.STARTED });

            await expect(distributor.start(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should throw when distribution already in progress', async () => {
            const analysis = seedBuiltAnalysis({ distribution_status: ProcessStatus.STARTING });

            await expect(distributor.start(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should allow retry when distribution FAILED', async () => {
            const analysis = seedBuiltAnalysis({ distribution_status: ProcessStatus.FAILED });
            registryRepository.seed(createTestRegistry());
            analysisNodeRepository.seed(createTestAnalysisNode({ analysis_id: 'analysis-1' }));

            const result = await distributor.start(analysis);
            expect(result.distribution_status).toBe(ProcessStatus.STARTING);
        });

        it('should throw when a node has no registry assigned', async () => {
            const analysis = seedBuiltAnalysis();
            registryRepository.seed(createTestRegistry());
            analysisNodeRepository.seed(createTestAnalysisNode({
                analysis_id: 'analysis-1',
                node: {
                    id: 'bad-node',
                    name: 'bad-node',
                    type: NodeType.DEFAULT,
                    registry_id: null,
                } as unknown as Node,
            }));

            await expect(distributor.start(analysis)).rejects.toThrow(BadRequestError);
        });
    });

    describe('check', () => {
        it('should dispatch check call', async () => {
            const analysis = seedBuiltAnalysis();

            const result = await distributor.check(analysis);

            expect(result.id).toBe('analysis-1');
            expect(caller.getCallsFor('callCheck')).toHaveLength(1);
        });

        it('should resolve entity by string ID', async () => {
            seedBuiltAnalysis();

            const result = await distributor.check('analysis-1');
            expect(result.id).toBe('analysis-1');
        });

        it('should throw for missing entity', async () => {
            await expect(distributor.check('nonexistent')).rejects.toThrow(BadRequestError);
        });

        it('should throw when build not initialized', async () => {
            const analysis = seedBuiltAnalysis({ build_status: null });

            await expect(distributor.check(analysis)).rejects.toThrow(AnalysisError);
        });

        it('should throw when build not EXECUTED', async () => {
            const analysis = seedBuiltAnalysis({ build_status: ProcessStatus.FAILED });

            await expect(distributor.check(analysis)).rejects.toThrow(AnalysisError);
        });
    });
});
