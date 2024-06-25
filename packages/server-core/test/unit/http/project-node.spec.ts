/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectNode } from '@privateaim/core-kit';
import {
    expectPropertiesEqualToSrc, initDataSource, useSuperTest,
} from '../../utils';
import { createSuperTestNode, createSuperTestProject } from '../../utils/domains';

describe('src/controllers/core/project-node', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await initDataSource();
    });

    let details : ProjectNode;

    it('should create resource', async () => {
        const project = await createSuperTestProject(superTest);
        const node = await createSuperTestNode(superTest);

        const response = await superTest
            .post('/project-nodes')
            .auth('admin', 'start123')
            .send({
                project_id: project.body.id,
                node_id: node.body.id,
            } as Partial<ProjectNode>);

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
        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
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
