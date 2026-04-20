/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NotFoundError } from '@ebec/http';
import type { Analysis } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { 
    beforeEach, 
    describe, 
    expect, 
    it, 
} from 'vitest';
import { AnalysisBuilder } from '../../../../src/core/services/analysis-builder/module.ts';
import {
    FakeAnalysisBuilderCaller,
    FakeAnalysisMetadataCaller,
    FakeEntityRepository,
} from '../helpers/index.ts';
import { createFullAnalysis } from '../../../utils/domains/index.ts';

describe('AnalysisBuilder', () => {
    let repository: FakeEntityRepository<Analysis>;
    let caller: FakeAnalysisBuilderCaller;
    let metadataCaller: FakeAnalysisMetadataCaller;
    let builder: AnalysisBuilder;

    beforeEach(() => {
        repository = new FakeEntityRepository<Analysis>();
        metadataCaller = new FakeAnalysisMetadataCaller(repository);
        caller = new FakeAnalysisBuilderCaller();
        builder = new AnalysisBuilder({
            repository, 
            caller, 
            metadataCaller, 
        });
    });

    describe('start', () => {
        it('should set build_status to STARTING and dispatch execute', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true });
            repository.seed(analysis);

            const result = await builder.start(analysis);

            expect(result.build_status).toBe(ProcessStatus.STARTING);
            expect(result.build_progress).toBeNull();
            expect(caller.getCallsFor('callExecute')).toHaveLength(1);
            expect(caller.getCallsFor('callExecute')[0].data.id).toBe('analysis-1');
        });

        it('should call metadataCaller.callRecalcDirect before checking', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true });
            repository.seed(analysis);

            await builder.start(analysis);

            expect(metadataCaller.getCallCount()).toBe(1);
            expect(metadataCaller.getCalls()[0].analysisId).toBe('analysis-1');
        });

        it('should resolve entity by string ID', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true });
            repository.seed(analysis);

            const result = await builder.start('analysis-1');

            expect(result.build_status).toBe(ProcessStatus.STARTING);
            expect(caller.getCallCount()).toBe(1);
        });

        it('should save entity to repository', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true });
            repository.seed(analysis);

            await builder.start(analysis);

            const saved = await repository.findOneById('analysis-1');
            expect(saved).toBeDefined();
            expect(saved!.build_status).toBe(ProcessStatus.STARTING);
        });

        it('should throw when config not locked', async () => {
            const analysis = createFullAnalysis({ configuration_locked: false });
            repository.seed(analysis);

            await expect(builder.start(analysis)).rejects.toThrow();
        });

        it('should throw when build nodes not valid', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true, build_nodes_valid: false });
            repository.seed(analysis);

            await expect(builder.start(analysis)).rejects.toThrow();
        });

        it('should allow retry when build FAILED', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true, build_status: ProcessStatus.FAILED });
            repository.seed(analysis);

            const result = await builder.start(analysis);
            expect(result.build_status).toBe(ProcessStatus.STARTING);
        });

        it('should throw when build already in progress', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true, build_status: ProcessStatus.STARTING });
            repository.seed(analysis);

            await expect(builder.start(analysis)).rejects.toThrow();
        });
    });

    describe('check', () => {
        it('should dispatch check call for in-progress build', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true, build_status: ProcessStatus.STARTED });
            repository.seed(analysis);

            const result = await builder.check(analysis);

            expect(result.id).toBe('analysis-1');
            expect(caller.getCallsFor('callCheck')).toHaveLength(1);
            expect(caller.getCallsFor('callCheck')[0].data.id).toBe('analysis-1');
        });

        it('should resolve entity by string ID', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true, build_status: ProcessStatus.STARTED });
            repository.seed(analysis);

            const result = await builder.check('analysis-1');
            expect(result.id).toBe('analysis-1');
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(builder.check('nonexistent')).rejects.toThrow(NotFoundError);
        });

        it('should throw when config not locked', async () => {
            const analysis = createFullAnalysis({ configuration_locked: false, build_status: ProcessStatus.STARTED });
            repository.seed(analysis);

            await expect(builder.check(analysis)).rejects.toThrow();
        });

        it('should throw when no build started', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true, build_status: null });
            repository.seed(analysis);

            await expect(builder.check(analysis)).rejects.toThrow();
        });

        it('should throw when build already EXECUTED', async () => {
            const analysis = createFullAnalysis({ configuration_locked: true, build_status: ProcessStatus.EXECUTED });
            repository.seed(analysis);

            await expect(builder.check(analysis)).rejects.toThrow();
        });
    });
});
