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

        const { data: project } = await client.project.create(createTestProject());

        // Aggregator project nodes are approved on creation, so they are eligible for
        // auto-assignment to a newly created analysis.
        const { data: aggregatorNode } = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ nodeId: aggregatorNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        const { data: persisted } = await client.analysis.getOne(analysis.id);
        expect(persisted.nodes).toBe(1);
        expect(persisted.nodesApproved).toBe(1);
        expect(persisted.configurationNodeAggregatorValid).toBe(true);
    });

    // Note: the "pending project nodes are skipped" branch is covered deterministically by
    // the unit test (test/unit/core/entities/analysis/service.spec.ts). It cannot be asserted
    // reliably at the HTTP level because CI runs with SKIP_PROJECT_APPROVAL=true, which
    // auto-approves every project node on creation — so there is no genuinely-pending node.

    it('should treat a manual re-assignment of an auto-assigned node as a no-op', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());

        const { data: aggregatorNode } = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));
        await client.projectNode.create({ nodeId: aggregatorNode.id, projectId: project.id });

        const { data: analysis } = await client.analysis.create({ projectId: project.id });

        // The node was already auto-assigned — re-assigning it must not raise a conflict.
        const { data: analysisNode } = await client.analysisNode.create({
            analysisId: analysis.id,
            nodeId: aggregatorNode.id,
        });
        expect(analysisNode.id).toBeDefined();

        const { data: persisted } = await client.analysis.getOne(analysis.id);
        expect(persisted.nodes).toBe(1);
    });
});
