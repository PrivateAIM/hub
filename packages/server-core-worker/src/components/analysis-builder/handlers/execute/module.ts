/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_ARTIFACT_TAG_LATEST,
} from '@privateaim/core-kit';
import type { AnalysisBuilderExecutePayload } from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderCommand,
    AnalysisBuilderEvent,
    AnalysisBuilderEventQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import {
    cleanupDockerImage,
    pullDockerImage, useCoreClient,
    useDocker,
} from '../../../../core';
import { bundleDockerFile, packContainerWithAnalysis } from '../../helpers';
import { buildDockerImage } from '../../../../core/docker/image-build';
import { useAnalysisBuilderLogger } from '../../utils';

export class AnalysisBuilderExecuteHandler implements ComponentHandler<
AnalysisBuilderCommand.EXECUTE,
AnalysisBuilderExecutePayload> {
    async handle(value: AnalysisBuilderExecutePayload, context: ComponentHandlerContext<AnalysisBuilderCommand.EXECUTE>): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.handleInternal(value, context);
        } catch (e) {
            await context.emitter.emit(
                AnalysisBuilderEvent.EXECUTION_FAILED,
                {
                    ...value,
                    error: e,
                },
                {
                    routing: AnalysisBuilderEventQueueRouterRouting,
                },
            );

            await cleanupDockerImage(value.id);
        }
    }

    async handleInternal(
        value: AnalysisBuilderExecutePayload,
        context: ComponentHandlerContext<AnalysisBuilderCommand.EXECUTE>,
    ): Promise<void> {
        await context.emitter.emit(
            AnalysisBuilderEvent.EXECUTION_STARTED,
            value,
            {
                routing: AnalysisBuilderEventQueueRouterRouting,
            },
        );

        const client = useCoreClient();

        const analysis = await client.analysis.getOne(value.id);
        const registry = await client.registry.getOne(analysis.registry_id, {
            fields: ['+account_secret'],
        });

        // -----------------------------------------------------------------------------------

        const { content: dockerFile, masterImagePath } = await bundleDockerFile({
            entity: analysis,
            hostname: registry.host,
        });

        // -----------------------------------------------------------------------------------

        useAnalysisBuilderLogger().info({
            message: `Pulling docker image ${masterImagePath}:latest`,
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        await pullDockerImage(`${masterImagePath}:${REGISTRY_ARTIFACT_TAG_LATEST}`);

        // -----------------------------------------------------------------------------------

        useAnalysisBuilderLogger().info({
            message: 'Building docker image.',
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        const imageURL = analysis.id;

        await buildDockerImage({
            content: dockerFile,
            imageName: imageURL,
        });

        // -----------------------------------------------------------------------------------

        useAnalysisBuilderLogger().info({
            message: `Creating docker container ${imageURL}:${REGISTRY_ARTIFACT_TAG_LATEST}`,
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        const container = await useDocker()
            .createContainer({ Image: imageURL });

        try {
            // -----------------------------------------------------------------------------------

            await packContainerWithAnalysis(container, {
                entity: analysis,
                masterImagePath,
            });

            // -----------------------------------------------------------------------------------

            useAnalysisBuilderLogger().info({
                message: `Commiting analysis docker container ${imageURL}:${REGISTRY_ARTIFACT_TAG_LATEST}`,
                command: AnalysisBuilderCommand.EXECUTE,
                analysis_id: analysis.id,
                [LogFlag.REF_ID]: analysis.id,
            });

            await container.commit({
                repo: imageURL,
                tag: REGISTRY_ARTIFACT_TAG_LATEST,
            });

            useAnalysisBuilderLogger().info({
                message: `Commited analysis docker container ${imageURL}:${REGISTRY_ARTIFACT_TAG_LATEST}`,
                command: AnalysisBuilderCommand.EXECUTE,
                analysis_id: analysis.id,
                [LogFlag.REF_ID]: analysis.id,
            });
        } finally {
            await container.remove({
                force: true,
            });
        }

        await context.emitter.emit(
            AnalysisBuilderEvent.EXECUTION_FINISHED,
            value,
            {
                routing: AnalysisBuilderEventQueueRouterRouting,
            },
        );
    }
}
