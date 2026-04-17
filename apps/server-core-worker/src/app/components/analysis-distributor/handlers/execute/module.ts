/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
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
import type { Client as CoreClient } from '@privateaim/core-http-kit';
import type { Client as DockerClient, ModemStreamWaitOptions  } from 'docken';
import type { ImagePushOptions } from 'dockerode';
import { waitForStream } from 'docken';
import {
    buildDockerAuthConfigFromRegistry,
    buildDockerImageURL,
    cleanupDockerImages,
} from '../../../../../adapters/docker/index.ts';
import { BuilderError } from '../../../analysis-builder/error';
import { useAnalysisDistributorLogger } from '../../helpers';

export class AnalysisDistributorExecuteHandler implements ComponentHandler<AnalysisDistributorEventMap, AnalysisDistributorCommand.EXECUTE> {
    protected coreClient: CoreClient;

    protected docker: DockerClient;

    constructor(ctx: { coreClient: CoreClient; docker: DockerClient }) {
        this.coreClient = ctx.coreClient;
        this.docker = ctx.docker;
    }

    async handle(
        value: AnalysisDistributorExecutePayload,
        context: ComponentHandlerContext<AnalysisDistributorEventMap, AnalysisDistributorCommand.EXECUTE>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.handleInternal(value, context);
        } catch (e) {
            useAnalysisDistributorLogger().error({
                message: e,
                command: AnalysisDistributorCommand.EXECUTE,
                analysis_id: value.id,
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

        const analysis = await this.coreClient.analysis.getOne(value.id);
        const registry = await this.coreClient.registry.getOne(analysis.registry_id, { fields: ['+account_secret'] });

        const { data: analysisNodes } = await this.coreClient.analysisNode.getMany({ filter: { analysis_id: analysis.id } });

        if (analysisNodes.length === 0) {
            // todo: custom error
            throw BuilderError.notFound();
        }

        const { data: nodes } = await this.coreClient.node.getMany({
            filter: { id: analysisNodes.map((analysisNode) => analysisNode.node_id) },
            relations: { registry_project: true },
        });

        // -----------------------------------------------------------------------------------

        let tags : string[];

        try {
            tags = await this.tagImage(
                analysis,
                nodes,
                registry,
            );
        } catch (e) {
            useAnalysisDistributorLogger().error({
                message: 'Tagging images failed',
                command: AnalysisDistributorCommand.EXECUTE,
                analysis_id: analysis.id,
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
            useAnalysisDistributorLogger().error({
                message: 'Pushing images failed',
                command: AnalysisDistributorCommand.EXECUTE,
                analysis_id: analysis.id,
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
        useAnalysisDistributorLogger().info({
            message: 'Tagging images',
            command: AnalysisDistributorCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        const image = this.docker
            .getImage(this.buildImageTag(analysis));

        await image.inspect();

        const tags : string[] = [];
        for (const node of nodes) {
            const nodeImageURL = buildDockerImageURL({
                hostname: registry.host,
                projectName: node.registry_project.external_name,
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

        useAnalysisDistributorLogger().info({
            message: 'Tagged images',
            command: AnalysisDistributorCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        return tags;
    }

    protected async pushImages(
        analysis: Analysis,
        tags: string[],
        options: { push: ImagePushOptions, stream: ModemStreamWaitOptions },
    ) {
        useAnalysisDistributorLogger().info({
            message: 'Pushing images',
            command: AnalysisDistributorCommand.EXECUTE,
            analysis_id: analysis.id,
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

        useAnalysisDistributorLogger().info({
            message: 'Pushed images',
            command: AnalysisDistributorCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });
    }

    protected buildImageTag(analysis: Analysis): string {
        return `${analysis.id}:${REGISTRY_ARTIFACT_TAG_LATEST}`;
    }
}
