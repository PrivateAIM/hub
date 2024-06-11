/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile, AnalysisNode } from '@privateaim/core';
import { AnalysisBucketType } from '@privateaim/core';
import {
    dropTestDatabase,
    expectPropertiesEqualToSrc,
    removeDateProperties,
    useSuperTest,
    useTestDatabase,
} from '../../utils';
import {
    createSuperTestAnalysis,
    createSuperTestAnalysisBucket,
    createSuperTestProject,
} from '../../utils/domains';

describe('controllers/analysis-bucket-file', () => {
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

        const analysisBucket = await createSuperTestAnalysisBucket(superTest, {
            analysis_id: analysis.body.id,
            type: AnalysisBucketType.CODE,
        });
        expect(analysisBucket.body.id).toBeDefined();

        const response = await superTest
            .post('/analysis-bucket-files')
            .auth('admin', 'start123')
            .send({
                bucket_id: analysisBucket.body.id,
                external_id: '28eb7728-c78d-4c2f-ab99-dc4bcee78da9',
                name: 'foo.bar',
                root: false,
            } satisfies Partial<AnalysisBucketFile>);

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();

        details = removeDateProperties(response.body);
    });

    it('should read collection', async () => {
        const response = await superTest
            .get('/analysis-bucket-files')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/analysis-bucket-files/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/analysis-bucket-files/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
