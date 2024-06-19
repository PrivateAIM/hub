/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket, AnalysisNode } from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import {
    dropTestDatabase,
    expectPropertiesEqualToSrc,
    removeDateProperties,
    useSuperTest,
    useTestDatabase,
} from '../../utils';
import {
    createSuperTestAnalysis,
    createSuperTestProject,
} from '../../utils/domains';

describe('controllers/analysis-file', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details : AnalysisNode;

    it('should create resource', async () => {
        const project = await createSuperTestProject(superTest);
        expect(project.body.id).toBeDefined();

        const analysis = await createSuperTestAnalysis(superTest, {
            project_id: project.body.id,
        });
        expect(analysis.body.id).toBeDefined();

        const response = await superTest
            .post('/analysis-buckets')
            .auth('admin', 'start123')
            .send({
                analysis_id: analysis.body.id,
                type: AnalysisBucketType.CODE,
            } satisfies Partial<AnalysisBucket>);

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();

        details = removeDateProperties(response.body);
    });

    it('should read collection', async () => {
        const response = await superTest
            .get('/analysis-buckets')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/analysis-buckets/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/analysis-buckets/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
