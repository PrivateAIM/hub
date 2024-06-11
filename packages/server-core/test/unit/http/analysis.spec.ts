/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core';
import { buildHTTPValidationErrorMessage } from '@privateaim/server-http-kit';
import {
    dropTestDatabase, expectPropertiesEqualToSrc, removeDateProperties, useSuperTest, useTestDatabase,
} from '../../utils';
import { TEST_DEFAULT_ANALYSIS, createSuperTestAnalysis, createSuperTestProject } from '../../utils/domains';

describe('src/controllers/core/analysis', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details : Analysis;

    it('should create resource', async () => {
        const proposal = await createSuperTestProject(superTest);
        const response = await createSuperTestAnalysis(superTest, {
            ...TEST_DEFAULT_ANALYSIS,
            project_id: proposal.body.id,
        });

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();
        expect(response.body.project_id).toEqual(proposal.body.id);

        details = removeDateProperties(response.body);
    });

    it('should get collection', async () => {
        const response = await superTest
            .get('/analyses')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/analyses/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should update resource', async () => {
        details.name = 'TestA';

        const response = await superTest
            .post(`/analyses/${details.id}`)
            .send(details)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/analyses/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });

    it('should not create resource with invalid project', async () => {
        const response = await createSuperTestAnalysis(superTest, {
            ...details,
            project_id: '28eb7728-c78d-4c2f-ab99-dc4bcee78da9',
        });

        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual(buildHTTPValidationErrorMessage<Analysis>(['project_id']));
    });

    it('should not create resource with invalid master-image', async () => {
        const project = await createSuperTestProject(superTest);
        const response = await createSuperTestAnalysis(superTest, {
            ...details,
            project_id: project.body.id,
            master_image_id: '28eb7728-c78d-4c2f-ab99-dc4bcee78da9',
        });

        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual(buildHTTPValidationErrorMessage<Analysis>(['master_image_id']));
    });
});
