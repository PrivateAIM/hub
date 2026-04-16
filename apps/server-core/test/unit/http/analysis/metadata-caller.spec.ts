/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisMetadataCommand } from '../../../../src/core/domains/index.ts';
import { DatabaseInjectionKey } from '../../../../src/app/modules/database/index.ts';
import { createTestApplication } from '../../../app';
import { createTestAnalysis, createTestProject } from '../../../utils/domains/index.ts';
import { FakeMetadataCaller } from '../../adapters/database/subscribers/analysis/helpers/fake-metadata-caller.ts';

describe('analysis metadata caller integration', () => {
    const suite = createTestApplication();
    const fakeMetadataCaller = new FakeMetadataCaller();

    beforeAll(async () => {
        await suite.setup();

        // Replace the real metadataCaller with our fake on all subscribers
        const analysisSubscriber = suite.container.resolve(DatabaseInjectionKey.AnalysisSubscriber);
        analysisSubscriber.setMetadataCaller(fakeMetadataCaller);

        const bucketFileSubscriber = suite.container.resolve(DatabaseInjectionKey.AnalysisBucketFileSubscriber);
        bucketFileSubscriber.setMetadataCaller(fakeMetadataCaller);

        const analysisNodeSubscriber = suite.container.resolve(DatabaseInjectionKey.AnalysisNodeSubscriber);
        analysisNodeSubscriber.setMetadataCaller(fakeMetadataCaller);
    });

    afterAll(async () => {
        await suite.teardown();
    });

    beforeEach(() => {
        fakeMetadataCaller.clear();
    });

    it('should call metadataCaller on analysis update', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());
        const analysis = await client.analysis.create(createTestAnalysis({ project_id: project.id }));

        fakeMetadataCaller.clear();

        await client.analysis.update(analysis.id, { name: 'updated-name' });

        expect(fakeMetadataCaller.getCallCount()).toBeGreaterThanOrEqual(1);

        const recalcCalls = fakeMetadataCaller.getCalls()
            .filter((c) => c.command === AnalysisMetadataCommand.RECALC);

        expect(recalcCalls.length).toBeGreaterThanOrEqual(1);
        expect(recalcCalls.some((c) => c.data.analysisId === analysis.id)).toBe(true);
    });

    it('should not call metadataCaller on analysis create (only storageManager)', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());

        fakeMetadataCaller.clear();

        await client.analysis.create(createTestAnalysis({ project_id: project.id }));

        // afterInsert only calls storageManager.check, not metadataCaller
        const recalcCalls = fakeMetadataCaller.getCalls()
            .filter((c) => c.command === AnalysisMetadataCommand.RECALC);
        expect(recalcCalls.length).toBe(0);
    });
});
