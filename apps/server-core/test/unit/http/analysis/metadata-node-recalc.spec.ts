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
import { ProcessStatus } from '@privateaim/kit';
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

    it('should set all aggregation columns correctly after assigning both node types', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());

        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const aggregatorNode = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));

        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });
        await client.projectNode.create({ node_id: aggregatorNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        await client.analysisNode.create({ analysis_id: analysis.id, node_id: defaultNode.id });
        await client.analysisNode.create({ analysis_id: analysis.id, node_id: aggregatorNode.id });

        const updated = await client.analysis.getOne(analysis.id);
        expect(updated.nodes).toBe(2);
        expect(updated.nodes_approved).toBeGreaterThanOrEqual(1);
        expect(updated.build_nodes_valid).toBe(true);
        expect(updated.configuration_node_default_valid).toBe(true);
        expect(updated.configuration_node_aggregator_valid).toBe(true);
        expect(updated.configuration_nodes_valid).toBe(true);
        expect(updated.execution_progress).toBe(0);
    });

    it('should not set configuration_nodes_valid with only one node type', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());
        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        await client.analysisNode.create({ analysis_id: analysis.id, node_id: defaultNode.id });

        const updated = await client.analysis.getOne(analysis.id);
        expect(updated.configuration_node_default_valid).toBe(true);
        expect(updated.configuration_node_aggregator_valid).toBe(false);
        expect(updated.configuration_nodes_valid).toBe(false);
    });

    it('should reset configuration_nodes_valid after removing aggregator from complete setup', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());
        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const aggregatorNode = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });
        await client.projectNode.create({ node_id: aggregatorNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        await client.analysisNode.create({ analysis_id: analysis.id, node_id: defaultNode.id });
        const aggNode = await client.analysisNode.create({ analysis_id: analysis.id, node_id: aggregatorNode.id });

        const afterBoth = await client.analysis.getOne(analysis.id);
        expect(afterBoth.configuration_nodes_valid).toBe(true);
        expect(afterBoth.nodes).toBe(2);

        await client.analysisNode.delete(aggNode.id);

        const afterRemove = await client.analysis.getOne(analysis.id);
        expect(afterRemove.configuration_nodes_valid).toBe(false);
        expect(afterRemove.configuration_node_aggregator_valid).toBe(false);
        expect(afterRemove.configuration_node_default_valid).toBe(true);
        expect(afterRemove.nodes).toBe(1);
    });

    it('should reset nodes count and flags after removing all nodes', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());
        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        const an = await client.analysisNode.create({ analysis_id: analysis.id, node_id: defaultNode.id });

        const afterAssign = await client.analysis.getOne(analysis.id);
        expect(afterAssign.nodes).toBe(1);

        await client.analysisNode.delete(an.id);

        const afterRemove = await client.analysis.getOne(analysis.id);
        expect(afterRemove.nodes).toBe(0);
        expect(afterRemove.configuration_node_default_valid).toBe(false);
        expect(afterRemove.configuration_node_aggregator_valid).toBe(false);
        expect(afterRemove.configuration_nodes_valid).toBe(false);
        expect(afterRemove.execution_progress).toBe(0);
    });

    it('should compute execution_progress as average of all nodes', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());
        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const aggregatorNode = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });
        await client.projectNode.create({ node_id: aggregatorNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        const an1 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: defaultNode.id });
        const an2 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: aggregatorNode.id });

        await client.analysisNode.update(an1.id, {
            execution_status: ProcessStatus.STARTED,
            execution_progress: 80,
        });
        await client.analysisNode.update(an2.id, {
            execution_status: ProcessStatus.STARTED,
            execution_progress: 40,
        });

        const updated = await client.analysis.getOne(analysis.id);
        // Math.floor((80 + 40) / 2) = 60
        expect(updated.execution_progress).toBe(60);
    });

    it('should recalc analysis execution_progress when all nodes reach 100', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());

        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const aggregatorNode = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        const defaultNode2 = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));

        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });
        await client.projectNode.create({ node_id: aggregatorNode.id, project_id: project.id });
        await client.projectNode.create({ node_id: defaultNode2.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        const an1 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: defaultNode.id });
        const an2 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: aggregatorNode.id });
        const an3 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: defaultNode2.id });

        // Update all 3 nodes to 100% progress
        await client.analysisNode.update(an1.id, {
            execution_status: ProcessStatus.EXECUTED,
            execution_progress: 100,
        });
        await client.analysisNode.update(an2.id, {
            execution_status: ProcessStatus.EXECUTED,
            execution_progress: 100,
        });
        await client.analysisNode.update(an3.id, {
            execution_status: ProcessStatus.EXECUTED,
            execution_progress: 100,
        });


        const updated = await client.analysis.getOne(analysis.id);
        expect(updated.execution_progress).toBe(100);
    });

    it('should recalc analysis execution_progress correctly under concurrent node updates', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());

        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const aggregatorNode = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        const defaultNode2 = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));

        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });
        await client.projectNode.create({ node_id: aggregatorNode.id, project_id: project.id });
        await client.projectNode.create({ node_id: defaultNode2.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        const an1 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: defaultNode.id });
        const an2 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: aggregatorNode.id });
        const an3 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: defaultNode2.id });

        // Update all 3 nodes concurrently
        await Promise.all([
            client.analysisNode.update(an1.id, {
                execution_status: ProcessStatus.EXECUTED,
                execution_progress: 100,
            }),
            client.analysisNode.update(an2.id, {
                execution_status: ProcessStatus.EXECUTED,
                execution_progress: 100,
            }),
            client.analysisNode.update(an3.id, {
                execution_status: ProcessStatus.EXECUTED,
                execution_progress: 100,
            }),
        ]);


        const updated = await client.analysis.getOne(analysis.id);
        expect(updated.execution_progress).toBe(100);
    });

    it('should set analysis execution_status to STARTED when first node starts', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());
        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const aggregatorNode = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });
        await client.projectNode.create({ node_id: aggregatorNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        const an1 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: defaultNode.id });
        await client.analysisNode.create({ analysis_id: analysis.id, node_id: aggregatorNode.id });

        await client.analysisNode.update(an1.id, { execution_status: ProcessStatus.STARTED });

        const updated = await client.analysis.getOne(analysis.id);
        expect(updated.execution_status).toBe(ProcessStatus.STARTED);
    });

    it('should keep analysis execution_status at STARTED when not all nodes are executed', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());
        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const aggregatorNode = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });
        await client.projectNode.create({ node_id: aggregatorNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        const an1 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: defaultNode.id });
        const an2 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: aggregatorNode.id });

        await client.analysisNode.update(an1.id, {
            execution_status: ProcessStatus.EXECUTED,
            execution_progress: 100,
        });
        await client.analysisNode.update(an2.id, {
            execution_status: ProcessStatus.STARTED,
            execution_progress: 20,
        });

        const updated = await client.analysis.getOne(analysis.id);
        expect(updated.execution_status).toBe(ProcessStatus.STARTED);
    });

    it('should set analysis execution_status to EXECUTED when all nodes are executed', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());
        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const aggregatorNode = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });
        await client.projectNode.create({ node_id: aggregatorNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        const an1 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: defaultNode.id });
        const an2 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: aggregatorNode.id });

        await client.analysisNode.update(an1.id, {
            execution_status: ProcessStatus.EXECUTED,
            execution_progress: 100,
        });
        await client.analysisNode.update(an2.id, {
            execution_status: ProcessStatus.EXECUTED,
            execution_progress: 100,
        });

        const updated = await client.analysis.getOne(analysis.id);
        expect(updated.execution_status).toBe(ProcessStatus.EXECUTED);
    });

    it('should set analysis execution_status to FAILED when any node fails', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());
        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const aggregatorNode = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });
        await client.projectNode.create({ node_id: aggregatorNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        const an1 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: defaultNode.id });
        const an2 = await client.analysisNode.create({ analysis_id: analysis.id, node_id: aggregatorNode.id });

        await client.analysisNode.update(an1.id, {
            execution_status: ProcessStatus.EXECUTED,
            execution_progress: 100,
        });
        await client.analysisNode.update(an2.id, { execution_status: ProcessStatus.FAILED });

        const updated = await client.analysis.getOne(analysis.id);
        expect(updated.execution_status).toBe(ProcessStatus.FAILED);
    });

    it('should reset analysis execution_status to null when no nodes have status', async () => {
        const { client } = suite;

        const project = await client.project.create(createTestProject());
        const defaultNode = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        await client.projectNode.create({ node_id: defaultNode.id, project_id: project.id });

        const analysis = await client.analysis.create({ project_id: project.id });

        await client.analysisNode.create({ analysis_id: analysis.id, node_id: defaultNode.id });

        const updated = await client.analysis.getOne(analysis.id);
        expect(updated.execution_status).toBeNull();
    });
});
