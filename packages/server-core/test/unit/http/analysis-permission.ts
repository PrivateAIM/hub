/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { extendObject } from '@authup/kit';
import type { AnalysisPermission } from '@privateaim/core-kit';
import {
    dropTestDatabase, expectPropertiesEqualToSrc, removeDateProperties, useSuperTest, useTestDatabase,
} from '../../utils';
import {
    createSuperTestAnalysis,
    createSuperTestProject,
} from '../../utils/domains';

describe('src/controllers/core/analysis-permission', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    const attributes : Partial<AnalysisPermission> = {
        permission_id: '667672f6-1c6b-468f-947f-6370cf18454c',
    };

    it('should create resource', async () => {
        const project = await createSuperTestProject(superTest);
        expect(project.body.id).toBeDefined();

        // todo: maybe create authup permission (policy)

        const analysis = await createSuperTestAnalysis(superTest, {
            project_id: project.body.id,
        });
        expect(analysis.body.id).toBeDefined();

        attributes.analysis_id = analysis.body.id;

        const response = await superTest
            .post('/analysis-permissions')
            .auth('admin', 'start123')
            .send(attributes);

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();

        delete response.body.analysis;
        delete response.body.node;

        extendObject(attributes, removeDateProperties(response.body));
    });

    it('should read collection', async () => {
        const response = await superTest
            .get('/analysis-permissions')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/analysis-permissions/${attributes.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(attributes, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/analysis-permissions/${attributes.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
