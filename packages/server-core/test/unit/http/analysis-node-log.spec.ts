/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AnalysisNodeRunStatus } from '@privateaim/core-kit';
import type { Analysis, AnalysisNodeLog, Node } from '@privateaim/core-kit';
import { LogLevel, wait } from '@privateaim/kit';
import { useLogStore } from '@privateaim/server-kit';
import {
    createTestSuite,
    removeDateProperties,
} from '../../utils';
import {
    createTestNode,
    createTestProject,
} from '../../utils/domains';

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

    let details : AnalysisNodeLog;

    it('should create resource', async () => {
        const client = suite.client();

        const analysisNodeLog = await client.analysisNodeLog.create({
            analysis_id: analysis!.id,
            node_id: node!.id,
            status: AnalysisNodeRunStatus.FAILED,
            level: LogLevel.ERROR,
            message: 'Analysis has been forcefully terminated.',
        });

        delete analysisNodeLog.analysis;
        delete analysisNodeLog.node;

        expect(analysisNodeLog.status).toEqual(AnalysisNodeRunStatus.FAILED);
        expect(analysisNodeLog.level).toEqual(LogLevel.ERROR);
        expect(analysisNodeLog.message).toEqual('Analysis has been forcefully terminated.');

        await wait(0);

        const store = useLogStore();
        const [data] = await store.query({
            labels: {
                entity: 'analysisNode',
                node_id: node.id,
                analysis_id: analysis.id,
            },
        });

        expect(data.length).toEqual(1);

        details = removeDateProperties(analysisNodeLog);
    });

    it('should read collection', async () => {
        const client = suite.client();

        const { data } = await client.analysisNodeLog.getMany({
            filters: {
                node_id: details.node_id,
                analysis_id: details.analysis_id,
            },
        });
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should delete resource', async () => {
        const client = suite.client();

        await client.analysisNodeLog.delete({
            filters: {
                node_id: details.node_id,
                analysis_id: details.analysis_id,
            },
        });
    });
});
