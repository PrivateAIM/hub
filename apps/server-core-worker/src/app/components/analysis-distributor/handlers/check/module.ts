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
import type {
    AnalysisDistributorCheckPayload,
    AnalysisDistributorEventMap,
} from '@privateaim/server-core-worker-kit';
import {
    AnalysisDistributorCommand,
    AnalysisDistributorEvent,
} from '@privateaim/server-core-worker-kit';
import type { ComponentHandler, ComponentHandlerContext, Logger } from '@privateaim/server-kit';
import type { Client as CoreClient } from '@privateaim/core-http-kit';
import { getManyAll } from '@privateaim/core-http-kit';
import type { Client as DockerClient } from 'docken';
import {
    buildDockerAuthConfigFromRegistry,
    buildDockerImageURL,
    isDockerDistributionImageMissingError,
} from '../../../../../adapters/docker/index.ts';
import { isAnalysisProcessStale } from '../../../helpers.ts';

export class AnalysisDistributorCheckHandler implements ComponentHandler<AnalysisDistributorEventMap, AnalysisDistributorCommand.CHECK> {
    protected coreClient: CoreClient;

    protected docker: DockerClient;

    protected logger: Logger | undefined;

    constructor(ctx: {
        coreClient: CoreClient; 
        docker: DockerClient; 
        logger?: Logger 
    }) {
        this.coreClient = ctx.coreClient;
        this.docker = ctx.docker;
        this.logger = ctx.logger;
    }

    async handle(
        value: AnalysisDistributorCheckPayload,
        context: ComponentHandlerContext<AnalysisDistributorEventMap, AnalysisDistributorCommand.CHECK>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.handleInternal(value, context);
        } catch (e) {
            this.logger?.error({
                message: e,
                command: AnalysisDistributorCommand.CHECK,
                analysis_id: value.id,
                [LogFlag.REF_ID]: value.id,
                event: AnalysisDistributorEvent.CHECK_FAILED,
            });

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
        value: AnalysisDistributorCheckPayload,
        context: ComponentHandlerContext<AnalysisDistributorEventMap, AnalysisDistributorCommand.CHECK>,
    ): Promise<void> {
        await context.handle(
            AnalysisDistributorEvent.CHECK_STARTED,
            value,
        );

        const analysis = await this.coreClient.analysis.getOne(value.id);

        // -----------------------------------------------------------------------------------

        const analysisNodes = await getManyAll((page) => this.coreClient.analysisNode.getMany({
            filter: { analysis_id: analysis.id },
            page,
        }));

        if (analysisNodes.length === 0) {
            await context.handle(
                AnalysisDistributorEvent.CHECK_FINISHED,
                value,
            );

            return;
        }

        const nodes = await getManyAll((page) => this.coreClient.node.getMany({
            filter: { id: analysisNodes.map((analysisNode) => analysisNode.node_id) },
            relations: { registry_project: true },
            page,
        }));

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

        let status: `${ProcessStatus}`;

        try {
            for (const node of nodes) {
                this.logger?.info({
                    message: `Checking analysis image of node ${node.name}`,
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

                // registry manifest lookup — verifies existence without pulling the image
                await this.docker.getImage(nodeImageURL)
                    .distribution({ authconfig: authConfig });
            }

            status = ProcessStatus.EXECUTED;
        } catch (e) {
            // anything but a missing-image response (daemon down, registry 5xx)
            // means the image state is unknown and no verdict can be made.
            if (!isDockerDistributionImageMissingError(e)) {
                throw e;
            }

            if (
                analysis.distribution_status === ProcessStatus.STARTED ||
                analysis.distribution_status === ProcessStatus.STARTING
            ) {
                // an in-progress distribution refreshes the entity via progress events;
                // a long-untouched one is orphaned (e.g. worker died) and recoverable as FAILED.
                status = isAnalysisProcessStale(analysis.updated_at) ?
                    ProcessStatus.FAILED :
                    analysis.distribution_status;
            } else {
                status = ProcessStatus.FAILED;
            }
        }

        // -----------------------------------------------------------------------------------

        await context.handle(
            AnalysisDistributorEvent.CHECK_FINISHED,
            {
                ...value,
                status,
            },
        );
    }
}
