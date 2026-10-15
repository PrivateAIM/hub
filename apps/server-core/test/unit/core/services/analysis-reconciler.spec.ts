/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import type { IAnalysisProcessChecker } from '../../../../src/core/services/analysis-reconciler/index.ts';
import { AnalysisReconciler } from '../../../../src/core/services/analysis-reconciler/index.ts';
import { ANALYSIS_PROCESS_STALE_THRESHOLD_MS } from '../../../../src/core/services/helpers.ts';
import { FakeAnalysisRepository } from '../entities/analysis/fake-repository.ts';
import { createFullAnalysis } from '../../../utils/domains/index.ts';

class FakeProcessChecker implements IAnalysisProcessChecker {
    readonly checked: string[] = [];

    readonly failing = new Set<string>();

    async check(input: string | Analysis): Promise<Analysis> {
        if (typeof input === 'string') {
            throw new Error('expected an entity');
        }

        if (this.failing.has(input.id)) {
            throw new Error('cannot check');
        }

        this.checked.push(input.id);
        return input;
    }
}

const NOW = new Date('2026-10-15T12:00:00.000Z');
const STALE = new Date(NOW.getTime() - ANALYSIS_PROCESS_STALE_THRESHOLD_MS - 1000).toISOString();
const FRESH = new Date(NOW.getTime() - 60_000).toISOString();

describe('AnalysisReconciler', () => {
    let repository: FakeAnalysisRepository;
    let builder: FakeProcessChecker;
    let distributor: FakeProcessChecker;
    let reconciler: AnalysisReconciler;

    function seed(id: string, overrides: Partial<Analysis>) {
        repository.seed(createFullAnalysis({ id, ...overrides }));
    }

    beforeEach(() => {
        repository = new FakeAnalysisRepository();
        builder = new FakeProcessChecker();
        distributor = new FakeProcessChecker();
        reconciler = new AnalysisReconciler({
            repository,
            builder,
            distributor,
        });
    });

    it('should check stale in-progress builds and distributions only', async () => {
        seed('build-starting', { buildStatus: ProcessStatus.STARTING, updatedAt: STALE });
        seed('build-started', { buildStatus: ProcessStatus.STARTED, updatedAt: STALE });
        seed('build-fresh', { buildStatus: ProcessStatus.STARTED, updatedAt: FRESH });
        seed('build-executed', { buildStatus: ProcessStatus.EXECUTED, updatedAt: STALE });
        seed('distribution-started', {
            buildStatus: ProcessStatus.EXECUTED,
            distributionStatus: ProcessStatus.STARTED,
            updatedAt: STALE,
        });
        seed('distribution-failed', {
            buildStatus: ProcessStatus.EXECUTED,
            distributionStatus: ProcessStatus.FAILED,
            updatedAt: STALE,
        });

        const result = await reconciler.reconcile(NOW);

        expect(builder.checked).toEqual(['build-starting', 'build-started']);
        expect(distributor.checked).toEqual(['distribution-started']);
        expect(result).toEqual({ checked: 3, failed: 0 });
    });

    it('should keep checking the other rows when one check fails', async () => {
        seed('a', { buildStatus: ProcessStatus.STARTED, updatedAt: STALE });
        seed('b', { buildStatus: ProcessStatus.STARTED, updatedAt: STALE });
        builder.failing.add('a');

        const result = await reconciler.reconcile(NOW);

        expect(builder.checked).toEqual(['b']);
        expect(result).toEqual({ checked: 1, failed: 1 });
    });
});
