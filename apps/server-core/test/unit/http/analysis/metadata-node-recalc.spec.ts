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

    it('should set configurationNodeDefaultValid after assigning default node', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        await client.projectNode.create({ nodeId: defaultNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });
        expect(analysis.configurationNodeDefaultValid).toBe(false);

        await client.analysisNode.create({
            analysisId: analysis.id,
            nodeId: defaultNode.id,
        });

        const { data: updated } = await client.analysis.getOne(analysis.id);
        expect(updated.configurationNodeDefaultValid).toBe(true);
    });

    it('should set configurationNodeAggregatorValid after assigning aggregator node', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        const { data: aggregatorNode } = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ nodeId: aggregatorNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });
        expect(analysis.configurationNodeAggregatorValid).toBe(false);

        await client.analysisNode.create({
            analysisId: analysis.id,
            nodeId: aggregatorNode.id,
        });

        const { data: updated } = await client.analysis.getOne(analysis.id);
        expect(updated.configurationNodeAggregatorValid).toBe(true);
    });

    it('should reset configurationNodeDefaultValid after removing default node', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        await client.projectNode.create({ nodeId: defaultNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        const { data: analysisNode } = await client.analysisNode.create({
            analysisId: analysis.id,
            nodeId: defaultNode.id,
        });

        const { data: afterAssign } = await client.analysis.getOne(analysis.id);
        expect(afterAssign.configurationNodeDefaultValid).toBe(true);

        await client.analysisNode.delete(analysisNode.id);

        const { data: afterRemove } = await client.analysis.getOne(analysis.id);
        expect(afterRemove.configurationNodeDefaultValid).toBe(false);
    });

    it('should set all aggregation columns correctly after assigning both node types', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());

        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const { data: aggregatorNode } = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));

        await client.projectNode.create({ nodeId: defaultNode.id, projectId: project.id });
        await client.projectNode.create({ nodeId: aggregatorNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        await client.analysisNode.create({ analysisId: analysis.id, nodeId: defaultNode.id });
        await client.analysisNode.create({ analysisId: analysis.id, nodeId: aggregatorNode.id });

        const { data: updated } = await client.analysis.getOne(analysis.id);
        expect(updated.nodes).toBe(2);
        expect(updated.nodesApproved).toBeGreaterThanOrEqual(1);
        expect(updated.buildNodesValid).toBe(true);
        expect(updated.configurationNodeDefaultValid).toBe(true);
        expect(updated.configurationNodeAggregatorValid).toBe(true);
        expect(updated.configurationNodesValid).toBe(true);
        expect(updated.executionProgress).toBe(0);
    });

    it('should not set configurationNodesValid with only one node type', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        await client.projectNode.create({ nodeId: defaultNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        await client.analysisNode.create({ analysisId: analysis.id, nodeId: defaultNode.id });

        const { data: updated } = await client.analysis.getOne(analysis.id);
        expect(updated.configurationNodeDefaultValid).toBe(true);
        expect(updated.configurationNodeAggregatorValid).toBe(false);
        expect(updated.configurationNodesValid).toBe(false);
    });

    it('should reset configurationNodesValid after removing aggregator from complete setup', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const { data: aggregatorNode } = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ nodeId: defaultNode.id, projectId: project.id });
        await client.projectNode.create({ nodeId: aggregatorNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        await client.analysisNode.create({ analysisId: analysis.id, nodeId: defaultNode.id });
        const { data: aggNode } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: aggregatorNode.id });

        const { data: afterBoth } = await client.analysis.getOne(analysis.id);
        expect(afterBoth.configurationNodesValid).toBe(true);
        expect(afterBoth.nodes).toBe(2);

        await client.analysisNode.delete(aggNode.id);

        const { data: afterRemove } = await client.analysis.getOne(analysis.id);
        expect(afterRemove.configurationNodesValid).toBe(false);
        expect(afterRemove.configurationNodeAggregatorValid).toBe(false);
        expect(afterRemove.configurationNodeDefaultValid).toBe(true);
        expect(afterRemove.nodes).toBe(1);
    });

    it('should reset nodes count and flags after removing all nodes', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        await client.projectNode.create({ nodeId: defaultNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        const { data: an } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: defaultNode.id });

        const { data: afterAssign } = await client.analysis.getOne(analysis.id);
        expect(afterAssign.nodes).toBe(1);

        await client.analysisNode.delete(an.id);

        const { data: afterRemove } = await client.analysis.getOne(analysis.id);
        expect(afterRemove.nodes).toBe(0);
        expect(afterRemove.configurationNodeDefaultValid).toBe(false);
        expect(afterRemove.configurationNodeAggregatorValid).toBe(false);
        expect(afterRemove.configurationNodesValid).toBe(false);
        expect(afterRemove.executionProgress).toBe(0);
    });

    it('should compute executionProgress as average of all nodes', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const { data: aggregatorNode } = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ nodeId: defaultNode.id, projectId: project.id });
        await client.projectNode.create({ nodeId: aggregatorNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        const { data: an1 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: defaultNode.id });
        const { data: an2 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: aggregatorNode.id });

        await client.analysisNode.update(an1.id, {
            executionStatus: ProcessStatus.STARTED,
            executionProgress: 80,
        });
        await client.analysisNode.update(an2.id, {
            executionStatus: ProcessStatus.STARTED,
            executionProgress: 40,
        });

        const { data: updated } = await client.analysis.getOne(analysis.id);
        // Math.floor((80 + 40) / 2) = 60
        expect(updated.executionProgress).toBe(60);
    });

    it('should recalc analysis executionProgress when all nodes reach 100', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());

        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const { data: aggregatorNode } = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        const { data: defaultNode2 } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));

        await client.projectNode.create({ nodeId: defaultNode.id, projectId: project.id });
        await client.projectNode.create({ nodeId: aggregatorNode.id, projectId: project.id });
        await client.projectNode.create({ nodeId: defaultNode2.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        const { data: an1 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: defaultNode.id });
        const { data: an2 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: aggregatorNode.id });
        const { data: an3 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: defaultNode2.id });

        // Update all 3 nodes to 100% progress
        await client.analysisNode.update(an1.id, {
            executionStatus: ProcessStatus.EXECUTED,
            executionProgress: 100,
        });
        await client.analysisNode.update(an2.id, {
            executionStatus: ProcessStatus.EXECUTED,
            executionProgress: 100,
        });
        await client.analysisNode.update(an3.id, {
            executionStatus: ProcessStatus.EXECUTED,
            executionProgress: 100,
        });


        const { data: updated } = await client.analysis.getOne(analysis.id);
        expect(updated.executionProgress).toBe(100);
    });

    it('should recalc analysis executionProgress correctly under concurrent node updates', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());

        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const { data: aggregatorNode } = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        const { data: defaultNode2 } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));

        await client.projectNode.create({ nodeId: defaultNode.id, projectId: project.id });
        await client.projectNode.create({ nodeId: aggregatorNode.id, projectId: project.id });
        await client.projectNode.create({ nodeId: defaultNode2.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        const { data: an1 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: defaultNode.id });
        const { data: an2 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: aggregatorNode.id });
        const { data: an3 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: defaultNode2.id });

        // Update all 3 nodes concurrently
        await Promise.all([
            client.analysisNode.update(an1.id, {
                executionStatus: ProcessStatus.EXECUTED,
                executionProgress: 100,
            }),
            client.analysisNode.update(an2.id, {
                executionStatus: ProcessStatus.EXECUTED,
                executionProgress: 100,
            }),
            client.analysisNode.update(an3.id, {
                executionStatus: ProcessStatus.EXECUTED,
                executionProgress: 100,
            }),
        ]);


        const { data: updated } = await client.analysis.getOne(analysis.id);
        expect(updated.executionProgress).toBe(100);
    });

    it('should set analysis executionStatus to STARTED when first node starts', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const { data: aggregatorNode } = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ nodeId: defaultNode.id, projectId: project.id });
        await client.projectNode.create({ nodeId: aggregatorNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        const { data: an1 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: defaultNode.id });
        await client.analysisNode.create({ analysisId: analysis.id, nodeId: aggregatorNode.id });

        await client.analysisNode.update(an1.id, { executionStatus: ProcessStatus.STARTED });

        const { data: updated } = await client.analysis.getOne(analysis.id);
        expect(updated.executionStatus).toBe(ProcessStatus.STARTED);
    });

    it('should keep analysis executionStatus at STARTED when not all nodes are executed', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const { data: aggregatorNode } = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ nodeId: defaultNode.id, projectId: project.id });
        await client.projectNode.create({ nodeId: aggregatorNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        const { data: an1 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: defaultNode.id });
        const { data: an2 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: aggregatorNode.id });

        await client.analysisNode.update(an1.id, {
            executionStatus: ProcessStatus.EXECUTED,
            executionProgress: 100,
        });
        await client.analysisNode.update(an2.id, {
            executionStatus: ProcessStatus.STARTED,
            executionProgress: 20,
        });

        const { data: updated } = await client.analysis.getOne(analysis.id);
        expect(updated.executionStatus).toBe(ProcessStatus.STARTED);
    });

    it('should set analysis executionStatus to EXECUTED when all nodes are executed', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const { data: aggregatorNode } = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ nodeId: defaultNode.id, projectId: project.id });
        await client.projectNode.create({ nodeId: aggregatorNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        const { data: an1 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: defaultNode.id });
        const { data: an2 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: aggregatorNode.id });

        await client.analysisNode.update(an1.id, {
            executionStatus: ProcessStatus.EXECUTED,
            executionProgress: 100,
        });
        await client.analysisNode.update(an2.id, {
            executionStatus: ProcessStatus.EXECUTED,
            executionProgress: 100,
        });

        const { data: updated } = await client.analysis.getOne(analysis.id);
        expect(updated.executionStatus).toBe(ProcessStatus.EXECUTED);
    });

    it('should set analysis executionStatus to FAILED when any node fails', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const { data: aggregatorNode } = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ nodeId: defaultNode.id, projectId: project.id });
        await client.projectNode.create({ nodeId: aggregatorNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        const { data: an1 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: defaultNode.id });
        const { data: an2 } = await client.analysisNode.create({ analysisId: analysis.id, nodeId: aggregatorNode.id });

        await client.analysisNode.update(an1.id, {
            executionStatus: ProcessStatus.EXECUTED,
            executionProgress: 100,
        });
        await client.analysisNode.update(an2.id, { executionStatus: ProcessStatus.FAILED });

        const { data: updated } = await client.analysis.getOne(analysis.id);
        expect(updated.executionStatus).toBe(ProcessStatus.FAILED);
    });

    it('should reset analysis executionStatus to null when no nodes have status', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        await client.projectNode.create({ nodeId: defaultNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        await client.analysisNode.create({ analysisId: analysis.id, nodeId: defaultNode.id });

        const { data: updated } = await client.analysis.getOne(analysis.id);
        expect(updated.executionStatus).toBeNull();
    });
});
