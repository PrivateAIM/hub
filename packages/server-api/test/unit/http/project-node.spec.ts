/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectNode } from '@personalhealthtrain/core';
import { useSuperTest } from '../../utils';
import { dropTestDatabase, useTestDatabase } from '../../utils';
import { createSuperTestNode, createSuperTestProject } from '../../utils/domains';
import { expectPropertiesEqualToSrc } from '../../utils';

describe('src/controllers/core/project-node', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details : ProjectNode;

    it('should create resource', async () => {
        const proposal = await createSuperTestProject(superTest);
        const station = await createSuperTestNode(superTest);

        const response = await superTest
            .post('/project-nodes')
            .auth('admin', 'start123')
            .send({
                proposal_id: proposal.body.id,
                station_id: station.body.id,
            });

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();

        details = response.body;
    });

    it('should read collection', async () => {
        const response = await superTest
            .get('/project-nodes')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/project-nodes/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/project-nodes/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
