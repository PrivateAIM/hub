/*
 * Copyright (c) 2021-2025.
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
import type { Analysis, Node } from '@privateaim/core-kit';
import { AnalysisCommand, AnalysisError, NodeType } from '@privateaim/core-kit';
import { extractErrorMessage } from '@privateaim/kit';
import { isClientError } from 'hapic';
import { createTestApplication } from '../../../app';
import { createTestNode, createTestProject } from '../../../utils/domains';

describe('analysis/command-lock', () => {
    let analysis : Analysis;

    let nodeDefault : Node;

    let nodeAggregator : Node;

    const suite = createTestApplication();

    beforeAll(async () => {
        await suite.setup();

        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());

        const { data: defaultNode } = await client.node.create(createTestNode({ type: NodeType.DEFAULT }));
        const { data: aggregatorNode } = await client.node.create(createTestNode({ type: NodeType.AGGREGATOR }));

        nodeDefault = defaultNode;
        nodeAggregator = aggregatorNode;

        // Create the analysis before the project nodes so this suite can drive the
        // node-validation gates one analysis-node at a time. Approved project nodes are
        // auto-assigned at analysis creation; creating the analysis first keeps that a no-op.
        const { data: analysisRecord } = await client.analysis.create({ projectId: project.id });

        analysis = analysisRecord;

        await client.projectNode.create({
            nodeId: nodeDefault.id,
            projectId: project.id,
        });

        await client.projectNode.create({
            nodeId: nodeAggregator.id,
            projectId: project.id,
        });
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it('should not lock analysis (defaultNodeRequired)', async () => {
        expect.assertions(1);

        const { client } = suite;

        try {
            await client.analysis.runCommand(
                analysis.id,
                AnalysisCommand.CONFIGURATION_LOCK,
            );
        } catch (e) {
            if (isClientError(e)) {
                expect(e.response.data.message).toEqual(extractErrorMessage(AnalysisError.defaultNodeRequired()));
                return;
            }

            throw e;
        }
    });

    it('should not lock analysis (aggregatorNodeRequired)', async () => {
        expect.assertions(1);

        const { client } = suite;

        await client.analysisNode.create({
            analysisId: analysis.id,
            nodeId: nodeDefault.id,
        });

        try {
            await client.analysis.runCommand(
                analysis.id,
                AnalysisCommand.CONFIGURATION_LOCK,
            );
        } catch (e) {
            if (isClientError(e)) {
                expect(e.response.data.message).toEqual(extractErrorMessage(AnalysisError.aggregatorNodeRequired()));
                return;
            }

            throw e;
        }
    });

    it('should not lock analysis (imageAssignmentRequired)', async () => {
        expect.assertions(1);

        const { client } = suite;

        await client.analysisNode.create({
            analysisId: analysis.id,
            nodeId: nodeAggregator.id,
        });

        try {
            await client.analysis.runCommand(
                analysis.id,
                AnalysisCommand.CONFIGURATION_LOCK,
            );
        } catch (e) {
            if (isClientError(e)) {
                expect(e.response.data.message).toEqual(extractErrorMessage(AnalysisError.entrypointRequired()));
                return;
            }

            throw e;
        }
    });
});
