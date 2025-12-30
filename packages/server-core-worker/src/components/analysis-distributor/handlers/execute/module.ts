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
import type { ImagePushOptions } from 'dockerode';
import type { ModemStreamWaitOptions } from 'docken';
import { waitForStream } from 'docken';
import {
    buildDockerAuthConfigFromRegistry,
    buildDockerImageURL,
    cleanupDockerImages,
    useCoreClient,
    useDocker,
} from '../../../../core';
import { BuilderError } from '../../../analysis-builder/error';
import { useAnalysisDistributorLogger } from '../../helpers';

export class AnalysisDistributorExecuteHandler implements ComponentHandler<AnalysisDistributorEventMap, AnalysisDistributorCommand.EXECUTE> {
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

        const client = useCoreClient();

        const analysis = await client.analysis.getOne(value.id);
        const registry = await client.registry.getOne(analysis.registry_id, {
            fields: ['+account_secret'],
        });

        const { data: analysisNodes } = await client.analysisNode.getMany({
            filter: {
                analysis_id: analysis.id,
            },
        });

        if (analysisNodes.length === 0) {
            // todo: custom error
            throw BuilderError.notFound();
        }

        const { data: nodes } = await client.node.getMany({
            filter: {
                id: analysisNodes.map((analysisNode) => analysisNode.node_id),
            },
            relations: {
                registry_project: true,
            },
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
                    push: {
                        authconfig: buildDockerAuthConfigFromRegistry(registry),
                    },
                    stream: {
                        onBuilding: async (progress) => {
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

        const image = useDocker()
            .getImage(this.buildImageTag(analysis));

        await image.inspect();

        const tags : string[] = [];
        for (let i = 0; i < nodes.length; i++) {
            const nodeImageURL = buildDockerImageURL({
                hostname: registry.host,
                projectName: nodes[i].registry_project.external_name,
                repositoryName: analysis.id,
                tagOrDigest: REGISTRY_ARTIFACT_TAG_LATEST,
            });

            tags.push(nodeImageURL);
        }

        try {
            for (let i = 0; i < tags.length; i++) {
                await image.tag({
                    repo: tags[i],
                    tag: REGISTRY_ARTIFACT_TAG_LATEST,
                });
            }
        } catch (e) {
            await cleanupDockerImages(tags);

            throw e;
        } finally {
            await image.remove({
                force: true,
            });
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

        const docker = useDocker();

        const forIndex = (value: number, index: number) => Math.floor(((index + 1) * value) / tags.length);

        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];

            const image = docker.getImage(tag);

            const stream = await image.push(options.push);

            await waitForStream(docker, stream, {
                onBuilding: async (process) => {
                    if (!options.stream.onBuilding) return;

                    await options.stream.onBuilding({
                        percent: forIndex(process.percent, i),
                        current: forIndex(process.current, i),
                        total: forIndex(process.total, i),
                    });
                },
            });

            await image.remove({
                force: true,
            });
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
