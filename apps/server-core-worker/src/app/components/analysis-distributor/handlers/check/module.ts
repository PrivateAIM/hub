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
    AnalysisDistributorCommand,
    AnalysisDistributorEvent,
} from '@privateaim/server-core-worker-kit';
import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import type { Client as CoreClient } from '@privateaim/core-http-kit';
import type { Client as DockerClient } from 'docken';
import {
    buildDockerAuthConfigFromRegistry,
    buildDockerImageURL,
} from '../../../../../adapters/docker/index.ts';
import { createAnalysisDistributorLogger } from '../../helpers';

export class AnalysisDistributorCheckHandler implements ComponentHandler<AnalysisDistributorEventMap, AnalysisDistributorCommand.CHECK> {
    protected coreClient: CoreClient;

    protected docker: DockerClient;

    constructor(ctx: { coreClient: CoreClient; docker: DockerClient }) {
        this.coreClient = ctx.coreClient;
        this.docker = ctx.docker;
    }

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

        const analysis = await this.coreClient.analysis.getOne(value.id);

        // -----------------------------------------------------------------------------------

        const { data: analysisNodes } = await this.coreClient.analysisNode.getMany({
            filter: { analysis_id: analysis.id },
            page: { limit: 1 },
        });

        if (analysisNodes.length === 0) {
            await context.handle(
                AnalysisDistributorEvent.CHECK_FINISHED,
                value,
            );

            return;
        }

        const { data: nodes } = await this.coreClient.node.getMany({
            filter: { id: analysisNodes.map((analysisNode) => analysisNode.node_id) },
            relations: { registry_project: true },
        });

        if (nodes.length === 0) {
            await context.handle(
                AnalysisDistributorEvent.CHECK_FINISHED,
                value,
            );

            return;
        }

        // -----------------------------------------------------------------------------------

        const registry = await this.coreClient.registry.getOne(analysis.registry_id, { fields: ['+account_secret'] });

        const authConfig = buildDockerAuthConfigFromRegistry(registry);

        try {
            for (const node of nodes) {
                createAnalysisDistributorLogger().info({
                    message: `Checking analysis image of node ${node.name}}`,
                    command: AnalysisDistributorCommand.CHECK,
                    analysis_id: analysis.id,
                    [LogFlag.REF_ID]: analysis.id,
                });

                const nodeImageURL = buildDockerImageURL({
                    hostname: registry.host,
                    projectName: node.registry_project.external_name,
                    repositoryName: analysis.id,
                    tagOrDigest: REGISTRY_ARTIFACT_TAG_LATEST,
                });

                const stream = await this.docker.pull(nodeImageURL, { authconfig: authConfig });
                await waitForModemStream(this.docker.modem, stream);
            }
        } catch {
            let status: `${ProcessStatus}`;

            if (
                analysis.distribution_status === ProcessStatus.STARTED ||
                analysis.distribution_status === ProcessStatus.STARTING
            ) {
                // todo: if started & starting trigger is to far back in time, status should also be failed.
                status = analysis.build_status;
            } else {
                status = ProcessStatus.FAILED;
            }

            await context.handle(
                AnalysisDistributorEvent.CHECK_FINISHED,
                {
                    ...value,
                    status,
                },
            );

            return;
        }

        // -----------------------------------------------------------------------------------

        await context.handle(
            AnalysisDistributorEvent.CHECK_FINISHED,
            {
                ...value,
                status: ProcessStatus.EXECUTED,
            },
        );
    }
}
