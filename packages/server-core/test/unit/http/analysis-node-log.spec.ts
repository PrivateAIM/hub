/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AnalysisNodeRunStatus } from '@privateaim/core-kit';
import type { Analysis, Node } from '@privateaim/core-kit';
import type { Log } from '@privateaim/telemetry-kit';
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

    let details : Log;

    it('should create resource', async () => {
        const client = suite.client();

        const analysisNodeLog = await client.analysisNodeLog.create({
            analysis_id: analysis!.id,
            node_id: node!.id,
            status: AnalysisNodeRunStatus.FAILED,
            level: LogLevel.ERROR,
            message: 'Analysis has been forcefully terminated.',
        });

        expect(analysisNodeLog.level).toEqual(LogLevel.ERROR);
        expect(analysisNodeLog.message).toEqual('Analysis has been forcefully terminated.');

        details = analysisNodeLog;
    });

    it('should read collection', async () => {
        const client = suite.client();

        return client.analysisNodeLog
            .getMany({
                filters: {
                    node_id: details.labels.node_id,
                    analysis_id: details.labels.analysis_id,
                },
            })
            .then((result) => {
                expect(result.data.length).toBeGreaterThanOrEqual(1);
            });
    });

    it('should delete resource', async () => {
        const client = suite.client();

        await client.analysisNodeLog.delete({
            filters: {
                node_id: details.labels.node_id,
                analysis_id: details.labels.analysis_id,
            },
        });
    });
});
