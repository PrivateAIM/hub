/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    buildRegistryClientConnectionStringFromRegistry,
} from '@privateaim/core-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { isClientErrorWithStatusCode } from 'hapic';
import type {
    AnalysisBuilderExecutePayload,
} from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderCommand,
    AnalysisBuilderEvent,
} from '@privateaim/server-core-worker-kit';
import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import {
    createBasicHarborAPIClient,
    useCoreClient,
} from '../../../../core';

export class AnalysisBuilderCheckHandler implements ComponentHandler {
    async handle(value: AnalysisBuilderExecutePayload, context: ComponentHandlerContext): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.handleInternal(value, context);
        } catch (e) {
            await context.handle(
                AnalysisBuilderEvent.CHECK_FAILED,
                {
                    ...value,
                    error: e,
                },
            );
        }
    }

    async handleInternal(
        value: AnalysisBuilderExecutePayload,
        context: ComponentHandlerContext,
    ): Promise<void> {
        await context.handle(
            AnalysisBuilderEvent.CHECK_STARTED,
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

        const [node] = nodes;

        if (typeof node === 'undefined') {
            await context.handle(
                AnalysisBuilderEvent.CHECK_FINISHED,
                value,
            );

            return;
        }

        useAnalysisBuilderLogger().info({
            message: `Checking docker registry ${registry.host}}`,
            command: AnalysisBuilderCommand.CHECK,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        const connectionString = buildRegistryClientConnectionStringFromRegistry(registry);
        const harborClient = createBasicHarborAPIClient(connectionString);

        try {
            const harborRepository = await harborClient.projectRepository
                .getOne({
                    projectName: node.registry_project.external_name,
                    repositoryName: analysis.id,
                });

            if (
                harborRepository &&
                harborRepository.artifact_count > 0
            ) {
                useAnalysisBuilderLogger().info({
                    message: `Found docker image ${analysis.id} in ${node.registry_project.external_name} of registry ${registry.name}}`,
                    command: AnalysisBuilderCommand.CHECK,
                    analysis_id: analysis.id,
                    node_id: node.id,
                    [LogFlag.REF_ID]: analysis.id,
                });
            }
        } catch (e) {
            if (!isClientErrorWithStatusCode(e, 404)) {
                throw e;
            }
        }

        // -----------------------------------------------------------------------------------

        await context.handle(
            AnalysisBuilderEvent.CHECK_FINISHED,
            value,
        );
    }
}
