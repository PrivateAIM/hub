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

describe('analysis: auto-assign project nodes', () => {
    const suite = createTestApplication();

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it('should auto-assign approved project nodes on analysis creation', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());

        // Aggregator project nodes are approved on creation, so they are eligible for
        // auto-assignment to a newly created analysis.
        const aggregatorNode = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ node_id: aggregatorNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        const persisted = await client.analysis.getOne(analysis.id);
        expect(persisted.nodes).toBe(1);
        expect(persisted.nodes_approved).toBe(1);
        expect(persisted.configuration_node_aggregator_valid).toBe(true);
    });

    it('should not assign project nodes that are still pending approval', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());

        // Default project nodes stay pending until approved, so they must not be assigned.
        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        const persisted = await client.analysis.getOne(analysis.id);
        expect(persisted.nodes).toBe(0);
        expect(persisted.configuration_node_default_valid).toBe(false);
    });

    it('should treat a manual re-assignment of an auto-assigned node as a no-op', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());

        const aggregatorNode = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ node_id: aggregatorNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        // The node was already auto-assigned — re-assigning it must not raise a conflict.
        const analysisNode = await client.analysisNode.create({
            analysis_id: analysis.id,
            node_id: aggregatorNode.id,
        });
        expect(analysisNode.id).toBeDefined();

        const persisted = await client.analysis.getOne(analysis.id);
        expect(persisted.nodes).toBe(1);
    });
});
