/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node, RegistryProject } from '@privateaim/core-kit';
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
import type { Logger } from '@privateaim/server-kit';
import type { ComponentHandler, ComponentHandlerContext } from 'hubwire';
import type { ICoreClient as CoreClient } from '@privateaim/core-http-kit';
import { getManyAll } from '@privateaim/core-http-kit';
import type { Client as DockerClient } from 'docken';
import {
    buildDockerAuthConfigFromRegistry,
    buildDockerImageURL,
    isDockerDistributionImageMissingError,
} from '../../../../../adapters/docker/index.ts';
import { BuilderError } from '../../../analysis-builder/error';
import { isRetryableFailure } from '../../../helpers.ts';

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
            if (isRetryableFailure(e, context.metadata)) {
                this.logger?.warn({
                    message: e,
                    command: AnalysisDistributorCommand.CHECK,
                    analysisId: value.id,
                    [LogFlag.REF_ID]: value.id,
                    retry: true,
                });

                throw e;
            }

            this.logger?.error({
                message: e,
                command: AnalysisDistributorCommand.CHECK,
                analysisId: value.id,
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

        const { data: analysis } = await this.coreClient.analysis.getOne(value.id);

        // A precondition that is permanently missing (no nodes, no registry,
        // no registry project) can never become a verdict. For an in-progress
        // distribution, report its status as seen, like a missing image, so
        // server-core's stale rule can fail it instead of it hanging forever.
        const inProgressStatus = analysis.distributionStatus === ProcessStatus.STARTED ||
            analysis.distributionStatus === ProcessStatus.STARTING ?
            analysis.distributionStatus :
            undefined;
        const finishUndecidable = () => context.handle(
            AnalysisDistributorEvent.CHECK_FINISHED,
            inProgressStatus ?
                {
                    ...value,
                    status: inProgressStatus,
                    checkedAt: analysis.updatedAt,
                } :
                value,
        );

        // -----------------------------------------------------------------------------------

        const analysisNodes = await getManyAll((page) => this.coreClient.analysisNode.getMany({
            filters: { analysisId: analysis.id },
            pagination: page,
        }));

        if (analysisNodes.length === 0) {
            await finishUndecidable();

            return;
        }

        const nodes = await getManyAll((page) => this.coreClient.node.getMany({
            filters: { id: analysisNodes.map((analysisNode) => analysisNode.nodeId) },
            relations: { registryProject: true },
            pagination: page,
        }));

        if (nodes.length === 0) {
            await finishUndecidable();

            return;
        }

        // -----------------------------------------------------------------------------------

        // `analysis.registryId` is nullable — it is unset until the distributor
        // assigns one, and the registry FK detaches (SET NULL) if the registry is
        // deleted while the analysis is in flight. Fail with a domain error rather
        // than requesting `/registries/null`.
        if (!analysis.registryId) {
            if (inProgressStatus) {
                await finishUndecidable();

                return;
            }

            throw BuilderError.registryNotFound();
        }

        // A node's registry project is optional and can be detached (SET NULL)
        // when the project is deleted, so the relation may be absent even though
        // the node is otherwise runnable. Validated up front rather than inside
        // the loop below, whose catch translates docker outcomes into a check
        // verdict — a precondition failure must not be routed through that. The
        // narrowed relation is collected alongside each node so the docker loop
        // never re-dereferences the nullable relation.
        const checks: { node: Node; registryProject: RegistryProject }[] = [];

        for (const node of nodes) {
            if (!node.registryProject) {
                if (inProgressStatus) {
                    await finishUndecidable();

                    return;
                }

                throw BuilderError.registryProjectNotFound(
                    `The node ${node.name} has no registry project.`,
                );
            }

            checks.push({ node, registryProject: node.registryProject });
        }

        const { data: registry } = await this.coreClient.registry.getOne(analysis.registryId, { fields: ['+accountSecret'] });

        const authConfig = buildDockerAuthConfigFromRegistry(registry);

        let status: `${ProcessStatus}`;

        try {
            for (const { node, registryProject } of checks) {
                this.logger?.info({
                    message: `Checking analysis image of node ${node.name}`,
                    command: AnalysisDistributorCommand.CHECK,
                    analysisId: analysis.id,
                    [LogFlag.REF_ID]: analysis.id,
                });

                const nodeImageURL = buildDockerImageURL({
                    hostname: registry.host,
                    projectName: registryProject.externalName,
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

            if (inProgressStatus) {
                // the image is not there yet; whether the distribution is orphaned
                // is server-core's verdict (it compares the row's age when applying).
                status = inProgressStatus;
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
                checkedAt: analysis.updatedAt,
            },
        );
    }
}
