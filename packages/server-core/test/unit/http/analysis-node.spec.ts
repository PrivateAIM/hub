/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNode } from '@privateaim/core';
import { removeDateProperties } from '../../utils';
import { expectPropertiesEqualToSrc } from '../../utils';
import { useSuperTest } from '../../utils';
import { dropTestDatabase, useTestDatabase } from '../../utils';
import {
    createSuperTestProject,
    createSuperTestProjectNode,
    createSuperTestNode,
    createSuperTestAnalysis,
} from '../../utils/domains';

describe('src/controllers/core/train-station', () => {
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

        const node = await createSuperTestNode(superTest);
        expect(node.body.id).toBeDefined();

        await createSuperTestProjectNode(superTest, {
            node_id: node.body.id,
            project_id: project.body.id,
        });

        const analysis = await createSuperTestAnalysis(superTest, {
            project_id: project.body.id,
        });

        expect(analysis.body.id).toBeDefined();

        const response = await superTest
            .post('/analysis-nodes')
            .auth('admin', 'start123')
            .send({
                analysis_id: analysis.body.id,
                node_id: node.body.id,
            } satisfies Partial<AnalysisNode>);

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();

        delete response.body.analysis;
        delete response.body.node;

        details = removeDateProperties(response.body);
    });

    it('should read collection', async () => {
        const response = await superTest
            .get('/analysis-nodes')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/analysis-nodes/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/analysis-nodes/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
