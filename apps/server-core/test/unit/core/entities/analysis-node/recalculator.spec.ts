/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { FakeEntityRepository } from '@privateaim/server-test-kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisNodeMetadataRecalculator } from '../../../../../src/core/entities/analysis-node/recalculator.ts';
import { AnalysisStorageManager } from '../../../../../src/core/services/analysis-storage-manager/module.ts';
import { createFullAnalysis, createTestAnalysisNode } from '../../../../utils/domains/index.ts';
import { FakeBucketDispatcher } from '../../services/helpers/fake-bucket-dispatcher.ts';
import { FakeAnalysisRepository } from '../analysis/fake-repository.ts';
import { FakeAnalysisNodeRepository } from './fake-repository.ts';

class ThrowingBucketDispatcher extends FakeBucketDispatcher {
    async dispatchClear(): Promise<void> {
        throw new Error('message bus unavailable');
    }
}

function createBucket(type: AnalysisBucketType): AnalysisBucket {
    return {
        id: `bucket-${type}`,
        type,
        bucketId: `ext-${type}`,
        analysisId: 'analysis-1',
        analysis: createFullAnalysis(),
        realmId: 'realm-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

describe('AnalysisNodeMetadataRecalculator', () => {
    let analysisRepository: FakeAnalysisRepository;
    let analysisNodeRepository: FakeAnalysisNodeRepository;
    let bucketRepository: FakeEntityRepository<AnalysisBucket>;
    let dispatcher: FakeBucketDispatcher;

    function createRecalculator(bucketDispatcher: FakeBucketDispatcher = dispatcher) {
        return new AnalysisNodeMetadataRecalculator({
            analysisRepository,
            analysisNodeRepository,
            config: { env: 'test', skipAnalysisApproval: true },
            storageManager: new AnalysisStorageManager({
                repository: analysisRepository,
                bucketRepository,
                dispatcher: bucketDispatcher,
            }),
        });
    }

    function seedNodes(statuses: (ProcessStatus | null)[]) {
        analysisNodeRepository.seed(statuses.map((executionStatus, index) => createTestAnalysisNode({
            id: `analysis-node-${index}`,
            nodeId: `node-${index}`,
            executionStatus,
        })));
    }

    beforeEach(() => {
        analysisRepository = new FakeAnalysisRepository();
        analysisNodeRepository = new FakeAnalysisNodeRepository();
        bucketRepository = new FakeEntityRepository<AnalysisBucket>();
        dispatcher = new FakeBucketDispatcher();

        analysisRepository.seed(createFullAnalysis());
        bucketRepository.seed([
            createBucket(AnalysisBucketType.CODE),
            createBucket(AnalysisBucketType.RESULT),
            createBucket(AnalysisBucketType.TEMP),
        ]);
    });

    it('should not write back a build status that changed after its read', async () => {
        seedNodes([ProcessStatus.EXECUTED, ProcessStatus.STARTED]);

        // the build finishes between the recalc's read and its write
        analysisRepository.beforeLockedUpdate = async () => {
            await analysisRepository.save({ ...analysisRepository.getAll()[0], buildStatus: ProcessStatus.EXECUTED });
        };

        await createRecalculator().recalc('analysis-1');

        expect(analysisRepository.getAll()[0]).toMatchObject({ buildStatus: ProcessStatus.EXECUTED, nodes: 2 });
    });

    it('should clear the temp bucket when every node executed', async () => {
        seedNodes([ProcessStatus.EXECUTED, ProcessStatus.EXECUTED]);

        await createRecalculator().recalc('analysis-1');

        expect(dispatcher.getCallsFor('dispatchClear').map((c) => c.data)).toEqual([{ id: `ext-${AnalysisBucketType.TEMP}` }]);
    });

    it('should clear the temp bucket when nodes executed, failed or stopped', async () => {
        seedNodes([ProcessStatus.EXECUTED, ProcessStatus.FAILED, ProcessStatus.STOPPED]);

        await createRecalculator().recalc('analysis-1');

        expect(dispatcher.getCallsFor('dispatchClear')).toHaveLength(1);
    });

    it('should not clear while a node has not started', async () => {
        seedNodes([ProcessStatus.EXECUTED, null]);

        await createRecalculator().recalc('analysis-1');

        expect(dispatcher.getCallsFor('dispatchClear')).toHaveLength(0);
    });

    it('should not clear while a node is still running', async () => {
        seedNodes([ProcessStatus.FAILED, ProcessStatus.EXECUTING]);
        await createRecalculator().recalc('analysis-1');

        analysisNodeRepository.clear();
        seedNodes([ProcessStatus.EXECUTED, ProcessStatus.STARTED]);
        await createRecalculator().recalc('analysis-1');

        expect(dispatcher.getCallsFor('dispatchClear')).toHaveLength(0);
    });

    it('should not clear without nodes', async () => {
        await createRecalculator().recalc('analysis-1');

        expect(dispatcher.getCallsFor('dispatchClear')).toHaveLength(0);
    });

    it('should not clear or throw without a temp bucket', async () => {
        bucketRepository.clear();
        bucketRepository.seed([createBucket(AnalysisBucketType.CODE), createBucket(AnalysisBucketType.RESULT)]);
        seedNodes([ProcessStatus.EXECUTED]);

        await expect(createRecalculator().recalc('analysis-1')).resolves.toBeDefined();
        expect(dispatcher.getCallsFor('dispatchClear')).toHaveLength(0);
    });

    it('should resolve when clearing fails', async () => {
        seedNodes([ProcessStatus.EXECUTED]);

        await expect(createRecalculator(new ThrowingBucketDispatcher()).recalc('analysis-1'))
            .resolves.toBeDefined();
    });
});
