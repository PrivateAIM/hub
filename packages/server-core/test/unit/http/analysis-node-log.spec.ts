/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll, beforeAll, describe, expect, it,
} from 'vitest';
import { ProcessStatus } from '@privateaim/kit';
import type { Analysis, Node } from '@privateaim/core-kit';
import { LogLevel } from '@privateaim/telemetry-kit';
import {
    createTestNode,
    createTestProject,
} from '../../utils/domains';
import { createTestSuite } from '../../utils';

describe('controllers > analysis-node-log', () => {
    const suite = createTestSuite();

    let analysis : Analysis | undefined;
    let node : Node | undefined;

    beforeAll(async () => {
        await suite.up();

        const client = suite.client();

        const project = await client.project.create(createTestProject());
        node = await client.node.create(createTestNode());

        await client.projectNode.create({
            node_id: node.id,
            project_id: project.id,
        });

        analysis = await client.analysis.create({
            project_id: project.id,
        });

        await client.analysisNode.create({
            analysis_id: analysis.id,
            node_id: node.id,
        });
    });

    afterAll(async () => {
        await suite.down();

        analysis = undefined;
        node = undefined;
    });

    it('should create resource', async () => {
        const client = suite.client();

        await client.analysisNodeLog.create({
            analysis_id: analysis!.id,
            node_id: node!.id,
            status: ProcessStatus.FAILED,
            level: LogLevel.ERROR,
            message: 'Analysis has been forcefully terminated.',
        });

        expect(true).toBeTruthy();
    });

    it('should read collection', async () => {
        const client = suite.client();

        const response = await client.analysisNodeLog
            .getMany({
                filters: {
                    analysis_id: analysis!.id,
                    node_id: node!.id,
                },
            });

        expect(response.data).toBeDefined();
        expect(response.meta).toBeDefined();
    });

    it('should delete resource', async () => {
        const client = suite.client();

        await client.analysisNodeLog.delete({
            filters: {
                analysis_id: analysis!.id,
                node_id: node!.id,
            },
        });
    });
});
