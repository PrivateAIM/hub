/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    REGISTRY_ARTIFACT_TAG_LATEST,
} from '@privateaim/core-kit';
import type { AnalysisBuilderEventMap, AnalysisBuilderExecutePayload } from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderCommand,
    AnalysisBuilderEvent,
    AnalysisBuilderEventQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import {
    buildDockerImage,
    cleanupDockerImage,
    useCoreClient,
    useDocker,
} from '../../../../core';
import { generateDockerFileContent, packContainerWithAnalysis } from '../../helpers';
import { useAnalysisBuilderLogger } from '../../utils';

export class AnalysisBuilderExecuteHandler implements ComponentHandler<AnalysisBuilderEventMap, AnalysisBuilderCommand.EXECUTE> {
    async handle(
        value: AnalysisBuilderExecutePayload,
        context: ComponentHandlerContext<AnalysisBuilderEventMap, AnalysisBuilderCommand.EXECUTE>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.handleInternal(value, context);
        } catch (e) {
            useAnalysisBuilderLogger().error({
                message: e,
                command: AnalysisBuilderCommand.EXECUTE,
                analysis_id: value.id,
                [LogFlag.REF_ID]: value.id,
                event: AnalysisBuilderEvent.EXECUTION_FAILED,
            });

            await context.handle(
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
        context: ComponentHandlerContext<AnalysisBuilderEventMap, AnalysisBuilderCommand.EXECUTE>,
    ): Promise<void> {
        await context.handle(
            AnalysisBuilderEvent.EXECUTION_STARTED,
            value,
        );

        const client = useCoreClient();

        const analysis = await client.analysis.getOne(value.id);

        // -----------------------------------------------------------------------------------

        useAnalysisBuilderLogger().info({
            message: 'Generating docker image.',
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        const content = await generateDockerFileContent(analysis);

        // -----------------------------------------------------------------------------------

        useAnalysisBuilderLogger().info({
            message: 'Building docker image.',
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        const imageURL = analysis.id;

        await buildDockerImage({
            content,
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

            await packContainerWithAnalysis(container, analysis);

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

        await context.handle(
            AnalysisBuilderEvent.EXECUTION_FINISHED,
            value,
        );
    }
}
