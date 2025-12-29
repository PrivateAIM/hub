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
import { type Analysis, REGISTRY_ARTIFACT_TAG_LATEST } from '@privateaim/core-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import {
    buildDockerAuthConfigFromRegistry,
    buildDockerImageURL,
    cleanupDockerImages, pushDockerImage,
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

        const image = useDocker()
            .getImage(this.buildImageTag(analysis));

        await image.inspect();

        const imageURLs : string[] = [];
        for (let i = 0; i < nodes.length; i++) {
            const nodeImageURL = buildDockerImageURL({
                hostname: registry.host,
                projectName: nodes[i].registry_project.external_name,
                repositoryName: analysis.id,
                tagOrDigest: REGISTRY_ARTIFACT_TAG_LATEST,
            });

            imageURLs.push(nodeImageURL);
        }

        try {
            for (let i = 0; i < imageURLs.length; i++) {
                useAnalysisDistributorLogger().info({
                    message: `Tagging image ${imageURLs[i]}`,
                    command: AnalysisDistributorCommand.EXECUTE,
                    analysis_id: analysis.id,
                    [LogFlag.REF_ID]: analysis.id,
                });

                await image.tag({
                    repo: imageURLs[i],
                    tag: REGISTRY_ARTIFACT_TAG_LATEST,
                });

                useAnalysisDistributorLogger().info({
                    message: `Tagged image ${imageURLs[i]}`,
                    command: AnalysisDistributorCommand.EXECUTE,
                    analysis_id: analysis.id,
                    [LogFlag.REF_ID]: analysis.id,
                });
            }
        } catch (e) {
            await cleanupDockerImages(imageURLs);

            throw e;
        } finally {
            await image.remove({
                force: true,
            });
        }

        // -----------------------------------------------------------------------------------

        const authConfig = buildDockerAuthConfigFromRegistry(registry);

        try {
            for (let i = 0; i < imageURLs.length; i++) {
                useAnalysisDistributorLogger().info({
                    message: `Pushing image ${imageURLs[i]}`,
                    command: AnalysisDistributorCommand.EXECUTE,
                    analysis_id: analysis.id,
                    [LogFlag.REF_ID]: analysis.id,
                });

                await pushDockerImage(imageURLs[i], authConfig);

                useAnalysisDistributorLogger().info({
                    message: `Pushed image ${imageURLs[i]}`,
                    command: AnalysisDistributorCommand.EXECUTE,
                    analysis_id: analysis.id,
                    [LogFlag.REF_ID]: analysis.id,
                });
            }
        } catch (e) {
            await cleanupDockerImages(imageURLs);

            throw e;
        }

        await context.handle(
            AnalysisDistributorEvent.EXECUTION_FINISHED,
            value,
        );
    }

    protected buildImageTag(analysis: Analysis): string {
        return `${analysis.id}:${REGISTRY_ARTIFACT_TAG_LATEST}`;
    }
}
