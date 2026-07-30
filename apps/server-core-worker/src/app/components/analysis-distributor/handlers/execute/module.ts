/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler, ComponentHandlerContext, Logger } from '@privateaim/server-kit';
import type {
    AnalysisDistributorEventMap,
    AnalysisDistributorExecutePayload,
} from '@privateaim/server-core-worker-kit';
import {
    AnalysisDistributorCommand,
    AnalysisDistributorEvent,
} from '@privateaim/server-core-worker-kit';
import type { Analysis, Node, Registry } from '@privateaim/core-kit';
import { REGISTRY_ARTIFACT_TAG_LATEST } from '@privateaim/core-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type { ICoreClient as CoreClient } from '@privateaim/core-http-kit';
import { getManyAll } from '@privateaim/core-http-kit';
import type { Client as DockerClient, ModemStreamWaitOptions  } from 'docken';
import type { ImagePushOptions } from 'dockerode';
import { waitForStream } from 'docken';
import {
    buildDockerAuthConfigFromRegistry,
    buildDockerImageURL,
    cleanupDockerImages,
} from '../../../../../adapters/docker/index.ts';
import { BuilderError } from '../../../analysis-builder/error';

export class AnalysisDistributorExecuteHandler implements ComponentHandler<AnalysisDistributorEventMap, AnalysisDistributorCommand.EXECUTE> {
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
        value: AnalysisDistributorExecutePayload,
        context: ComponentHandlerContext<AnalysisDistributorEventMap, AnalysisDistributorCommand.EXECUTE>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.handleInternal(value, context);
        } catch (e) {
            this.logger?.error({
                message: e,
                command: AnalysisDistributorCommand.EXECUTE,
                analysisId: value.id,
                [LogFlag.REF_ID]: value.id,
                event: AnalysisDistributorEvent.EXECUTION_FAILED,
            });

            await context.handle(
                AnalysisDistributorEvent.EXECUTION_FAILED,
                {
                    ...value,
                    error: e,
                },
            );
        }
    }

    async handleInternal(
        value: AnalysisDistributorExecutePayload,
        context: ComponentHandlerContext<AnalysisDistributorEventMap, AnalysisDistributorCommand.EXECUTE>,
    ): Promise<void> {
        await context.handle(
            AnalysisDistributorEvent.EXECUTION_STARTED,
            value,
        );

        const { data: analysis } = await this.coreClient.analysis.getOne(value.id);

        // `analysis.registryId` is nullable — it is unset until the distributor
        // assigns one, and the registry FK detaches (SET NULL) if the registry is
        // deleted while the analysis is in flight. Fail with a domain error rather
        // than requesting `/registries/null`.
        if (!analysis.registryId) {
            throw BuilderError.registryNotFound();
        }

        const { data: registry } = await this.coreClient.registry.getOne(analysis.registryId, { fields: ['+accountSecret'] });

        const analysisNodes = await getManyAll((page) => this.coreClient.analysisNode.getMany({
            filters: { analysisId: analysis.id },
            pagination: page,
        }));

        if (analysisNodes.length === 0) {
            // todo: custom error
            throw BuilderError.notFound();
        }

        const nodes = await getManyAll((page) => this.coreClient.node.getMany({
            filters: { id: analysisNodes.map((analysisNode) => analysisNode.nodeId) },
            relations: { registryProject: true },
            pagination: page,
        }));

        // -----------------------------------------------------------------------------------

        let tags : string[];

        try {
            tags = await this.tagImage(
                analysis,
                nodes,
                registry,
            );
        } catch (e) {
            this.logger?.error({
                message: 'Tagging images failed',
                command: AnalysisDistributorCommand.EXECUTE,
                analysisId: analysis.id,
                [LogFlag.REF_ID]: analysis.id,
            });

            throw e;
        }

        // -----------------------------------------------------------------------------------

        try {
            await this.pushImages(
                analysis,
                tags,
                {
                    push: { authconfig: buildDockerAuthConfigFromRegistry(registry) },
                    stream: {
                        onPushing: async (progress) => {
                            await context.handle(
                                AnalysisDistributorEvent.EXECUTION_PROGRESS,
                                {
                                    progress,
                                    id: analysis.id,
                                },
                            );
                        },
                    },
                },
            );
        } catch (e) {
            this.logger?.error({
                message: 'Pushing images failed',
                command: AnalysisDistributorCommand.EXECUTE,
                analysisId: analysis.id,
                [LogFlag.REF_ID]: analysis.id,
            });

            throw e;
        }

        await context.handle(
            AnalysisDistributorEvent.EXECUTION_FINISHED,
            value,
        );
    }

    protected async tagImage(
        analysis: Analysis,
        nodes: Node[],
        registry: Registry,
    ) : Promise<string[]> {
        this.logger?.info({
            message: 'Tagging images',
            command: AnalysisDistributorCommand.EXECUTE,
            analysisId: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        const image = this.docker
            .getImage(this.buildImageTag(analysis));

        await image.inspect();

        const tags : string[] = [];
        for (const node of nodes) {
            // A node's registry project is optional and can be detached
            // (SET NULL) when the project is deleted, so the relation may be
            // absent even though the node is otherwise runnable.
            if (!node.registryProject) {
                throw BuilderError.registryProjectNotFound(
                    `The node ${node.name} has no registry project.`,
                );
            }

            const nodeImageURL = buildDockerImageURL({
                hostname: registry.host,
                projectName: node.registryProject.externalName,
                repositoryName: analysis.id,
                tagOrDigest: REGISTRY_ARTIFACT_TAG_LATEST,
            });

            tags.push(nodeImageURL);
        }

        try {
            for (const tag of tags) {
                await image.tag({
                    repo: tag,
                    tag: REGISTRY_ARTIFACT_TAG_LATEST,
                });
            }
        } catch (e) {
            await cleanupDockerImages(this.docker, tags);

            throw e;
        } finally {
            await image.remove({ force: true });
        }

        this.logger?.info({
            message: 'Tagged images',
            command: AnalysisDistributorCommand.EXECUTE,
            analysisId: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        return tags;
    }

    protected async pushImages(
        analysis: Analysis,
        tags: string[],
        options: { push: ImagePushOptions, stream: ModemStreamWaitOptions },
    ) {
        this.logger?.info({
            message: 'Pushing images',
            command: AnalysisDistributorCommand.EXECUTE,
            analysisId: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        const calcForIndex = (value: number, index: number) => {
            const current = (index + 1) * value;
            if (current === 0) {
                return 0;
            }

            return Math.floor(current / tags.length);
        };

        try {
            for (const [i, tag] of tags.entries()) {
                const image = this.docker.getImage(tag);

                const stream = await image.push(options.push);

                await waitForStream(this.docker, stream, {
                    onPushing: async (process) => {
                        if (!options.stream.onPushing) return;

                        await options.stream.onPushing({
                            percent: calcForIndex(process.percent, i),
                            current: calcForIndex(process.current, i),
                            total: calcForIndex(process.total, i),
                        });
                    },
                });
            }
        } finally {
            await cleanupDockerImages(this.docker, tags);
        }

        this.logger?.info({
            message: 'Pushed images',
            command: AnalysisDistributorCommand.EXECUTE,
            analysisId: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });
    }

    protected buildImageTag(analysis: Analysis): string {
        return `${analysis.id}:${REGISTRY_ARTIFACT_TAG_LATEST}`;
    }
}
