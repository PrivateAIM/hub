/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { extendObject } from '@authup/kit';
import type { AnalysisNode } from '@privateaim/core-kit';
import { AnalysisNodeRunStatus } from '@privateaim/core-kit';
import { createTestSuite, expectPropertiesEqualToSrc, removeDateProperties } from '../../utils';
import { createTestNode, createTestProject } from '../../utils/domains';

describe('src/controllers/core/analysis-node', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    let details : AnalysisNode;

    it('should create resource', async () => {
        const client = suite.client();

        const project = await client.project.create(createTestProject());
        expect(project.id).toBeDefined();

        const node = await client.node.create(createTestNode());
        expect(node.id).toBeDefined();

        await client.projectNode.create({
            node_id: node.id,
            project_id: project.id,
        });

        const analysis = await client.analysis.create({
            project_id: project.id,
        });
        expect(analysis.id).toBeDefined();

        const analysisNode = await client.analysisNode.create({
            analysis_id: analysis.id,
            node_id: node.id,
            run_status: AnalysisNodeRunStatus.STARTING,
        });

        delete analysisNode.analysis;
        delete analysisNode.node;

        details = removeDateProperties(analysisNode);
    });

    it('should update record', async () => {
        const client = suite.client();

        const data = await client.analysisNode.update(details.id, {
            ...details,
            run_status: AnalysisNodeRunStatus.STARTED,
        });

        expect(data.run_status).toEqual(AnalysisNodeRunStatus.STARTED);

        extendObject(details, data);
    });

    it('should read collection', async () => {
        const client = suite.client();

        const { data } = await client.analysisNode.getMany();
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should read resource', async () => {
        const client = suite.client();

        const data = await client.analysisNode.getOne(details.id);
        expectPropertiesEqualToSrc(details, data);
    });

    it('should delete resource', async () => {
        const client = suite.client();

        await client.analysisNode.delete(details.id);
    });
});
