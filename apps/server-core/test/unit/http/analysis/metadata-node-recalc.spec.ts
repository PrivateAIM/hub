/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { NodeType } from '@privateaim/core-kit';
import { createTestApplication } from '../../../app';
import { createTestNode, createTestProject } from '../../../utils/domains/index.ts';

describe('analysis metadata: node recalc', () => {
    const suite = createTestApplication();

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it('should set configuration_node_default_valid after assigning default node', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());
        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });
        expect(analysis.configuration_node_default_valid).toBe(false);

        await client.analysisNode.create({
            analysis_id: analysis.id,
            node_id: defaultNode.id,
        });

        const updated = await client.analysis.getOne(analysis.id);
        expect(updated.configuration_node_default_valid).toBe(true);
    });

    it('should set configuration_node_aggregator_valid after assigning aggregator node', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());
        const aggregatorNode = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ node_id: aggregatorNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });
        expect(analysis.configuration_node_aggregator_valid).toBe(false);

        await client.analysisNode.create({
            analysis_id: analysis.id,
            node_id: aggregatorNode.id,
        });

        const updated = await client.analysis.getOne(analysis.id);
        expect(updated.configuration_node_aggregator_valid).toBe(true);
    });

    it('should reset configuration_node_default_valid after removing default node', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());
        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        const analysisNode = await client.analysisNode.create({
            analysis_id: analysis.id,
            node_id: defaultNode.id,
        });

        const afterAssign = await client.analysis.getOne(analysis.id);
        expect(afterAssign.configuration_node_default_valid).toBe(true);

        await client.analysisNode.delete(analysisNode.id);

        const afterRemove = await client.analysis.getOne(analysis.id);
        expect(afterRemove.configuration_node_default_valid).toBe(false);
    });
});
