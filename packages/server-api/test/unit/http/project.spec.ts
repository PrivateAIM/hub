/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Project } from '@personalhealthtrain/core';
import {
    dropTestDatabase, expectPropertiesEqualToSrc, removeDateProperties, useSuperTest, useTestDatabase,
} from '../../utils';
import { createSuperTestProject } from '../../utils/domains';

describe('src/controllers/core/project', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details : Project;

    it('should create resource', async () => {
        const response = await createSuperTestProject(superTest);

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();
        expect(response.body.analyses).toEqual(0);

        details = removeDateProperties(response.body);
    });

    it('should read collection', async () => {
        const response = await superTest
            .get('/projects')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/projects/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should update resource', async () => {
        details.name = 'TestA';

        const response = await superTest
            .post(`/projects/${details.id}`)
            .send(details)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/projects/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
