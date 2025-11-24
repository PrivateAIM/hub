/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import {
    createTestSuite,
    expectSrcProperties,
    removeDateProperties,
} from '../../utils';
import {
    createTestProject,
} from '../../utils/domains';

describe('controllers/analysis-file', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    let details : AnalysisBucket;

    it('should create resource', async () => {
        const client = suite.client();

        const project = await client.project.create(createTestProject());
        expect(project.id).toBeDefined();

        const analysis = await client.analysis.create({
            project_id: project.id,
        });
        expect(analysis.id).toBeDefined();

        const analysisBucket = await client.analysisBucket.create({
            analysis_id: analysis.id,
            type: AnalysisBucketType.CODE,
        });

        details = removeDateProperties(analysisBucket);
    });

    it('should read collection', async () => {
        const client = suite.client();

        const { data } = await client.analysisBucket.getMany();
        expect(data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const client = suite.client();

        const data = await client.analysisBucket.getOne(details.id);
        expectSrcProperties(details, data);
    });

    it('should delete resource', async () => {
        const client = suite.client();

        await client.analysisBucket.delete(details.id);
    });
});
