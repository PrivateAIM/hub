/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_ARTIFACT_TAG_LATEST,
} from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { waitForModemStream } from 'docken';
import type {
    AnalysisBuilderCheckPayload,
    AnalysisDistributorEventMap,
} from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderEvent,
    AnalysisDistributorCommand,
    AnalysisDistributorEvent,
} from '@privateaim/server-core-worker-kit';
import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import {
    buildDockerAuthConfigFromRegistry,
    buildDockerImageURL,
    useCoreClient, useDocker,
} from '../../../../core';
import { useAnalysisDistributorLogger } from '../../helpers';

export class AnalysisDistributorCheckHandler implements ComponentHandler<AnalysisDistributorEventMap, AnalysisDistributorCommand.CHECK> {
    async handle(
        value: AnalysisBuilderCheckPayload,
        context: ComponentHandlerContext<AnalysisDistributorEventMap, AnalysisDistributorCommand.CHECK>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.handleInternal(value, context);
        } catch (e) {
            await context.handle(
                AnalysisDistributorEvent.CHECK_FAILED,
                {
                    ...value,
                    error: e,
                },
            );
        }
    }

    async handleInternal(
        value: AnalysisBuilderCheckPayload,
        context: ComponentHandlerContext<AnalysisDistributorEventMap, AnalysisDistributorCommand.CHECK>,
    ): Promise<void> {
        await context.handle(
            AnalysisDistributorEvent.CHECK_STARTED,
            value,
        );

        const client = useCoreClient();

        const analysis = await client.analysis.getOne(value.id);
        const registry = await client.registry.getOne(analysis.registry_id, {
            fields: ['+account_secret'],
        });

        // -----------------------------------------------------------------------------------

        const { data: analysisNodes } = await client.analysisNode.getMany({
            filter: {
                analysis_id: analysis.id,
            },
            page: {
                limit: 1,
            },
        });

        if (analysisNodes.length === 0) {
            await context.handle(
                AnalysisBuilderEvent.CHECK_FINISHED,
                value,
            );

            return;
        }

        const { data: nodes } = await client.node.getMany({
            filter: {
                id: analysisNodes.map((analysisNode) => analysisNode.node_id),
            },
            relations: {
                registry_project: true,
            },
        });

        if (nodes.length === 0) {
            await context.handle(
                AnalysisBuilderEvent.CHECK_FINISHED,
                value,
            );

            return;
        }

        const docker = useDocker();
        const authConfig = buildDockerAuthConfigFromRegistry(registry);

        for (let i = 0; i < nodes.length; i++) {
            useAnalysisDistributorLogger().info({
                message: `Checking analysis image of node ${nodes[i].name}}`,
                command: AnalysisDistributorCommand.CHECK,
                analysis_id: analysis.id,
                [LogFlag.REF_ID]: analysis.id,
            });

            const nodeImageURL = buildDockerImageURL({
                hostname: registry.host,
                projectName: nodes[i].registry_project.external_name,
                repositoryName: analysis.id,
                tagOrDigest: REGISTRY_ARTIFACT_TAG_LATEST,
            });

            const stream = await docker.pull(nodeImageURL, {
                authconfig: authConfig,
            });
            await waitForModemStream(docker.modem, stream);
        }

        // -----------------------------------------------------------------------------------

        await context.handle(
            AnalysisDistributorEvent.CHECK_FINISHED,
            {
                ...value,
                status: ProcessStatus.FINISHED,
            },
        );
    }
}
