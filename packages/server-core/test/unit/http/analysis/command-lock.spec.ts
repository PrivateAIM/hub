/*
 * Copyright (c) 2021-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll, beforeAll, describe, expect, it,
} from 'vitest';
import type { Analysis, Node } from '@privateaim/core-kit';
import { AnalysisCommand, AnalysisError, NodeType } from '@privateaim/core-kit';
import { extractErrorMessage } from '@privateaim/kit';
import { isClientError } from 'hapic';
import { createTestSuite } from '../../../utils';
import { createTestNode, createTestProject } from '../../../utils/domains';

describe('analysis/command-lock', () => {
    let analysis : Analysis;

    let nodeDefault : Node;

    let nodeAggregator : Node;

    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();

        const client = suite.client();

        const project = await client.project.create(createTestProject());

        nodeDefault = await client.node.create(createTestNode({
            type: NodeType.DEFAULT,
        }));
        nodeAggregator = await client.node.create(createTestNode({
            type: NodeType.AGGREGATOR,
        }));

        await client.projectNode.create({
            node_id: nodeDefault.id,
            project_id: project.id,
        });

        await client.projectNode.create({
            node_id: nodeAggregator.id,
            project_id: project.id,
        });

        analysis = await client.analysis.create({
            project_id: project.id,
        });
    });

    afterAll(async () => {
        await suite.down();
    });

    it('should not lock analysis (defaultNodeRequired)', async () => {
        expect.assertions(1);

        const client = suite.client();

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

        const client = suite.client();

        await client.analysisNode.create({
            analysis_id: analysis.id,
            node_id: nodeDefault.id,
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

        const client = suite.client();

        await client.analysisNode.create({
            analysis_id: analysis.id,
            node_id: nodeAggregator.id,
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
