/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import type {
    AnalysisBuilderCheckPayload,
    AnalysisBuilderCommand,
    AnalysisBuilderEventMap,
    AnalysisBuilderExecutePayload,
} from '@privateaim/server-core-worker-kit';
import { AnalysisBuilderEvent } from '@privateaim/server-core-worker-kit';
import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import { useCoreClient, useDocker } from '../../../../core';

export class AnalysisBuilderCheckHandler implements ComponentHandler<AnalysisBuilderEventMap, AnalysisBuilderCommand.CHECK> {
    async handle(
        value: AnalysisBuilderCheckPayload,
        context: ComponentHandlerContext<AnalysisBuilderEventMap, AnalysisBuilderCommand.CHECK>,
    ): Promise<void> {
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
        context: ComponentHandlerContext<AnalysisBuilderEventMap, AnalysisBuilderCommand.CHECK>,
    ): Promise<void> {
        await context.handle(
            AnalysisBuilderEvent.CHECK_STARTED,
            value,
        );

        const client = useCoreClient();
        const analysis = await client.analysis.getOne(value.id);

        const docker = useDocker();
        const image = docker.getImage(`${value.id}:latest`);

        try {
            const imageInfo = await image.inspect();

            await context.handle(
                AnalysisBuilderEvent.CHECK_FINISHED,
                {
                    ...value,
                    status: ProcessStatus.EXECUTED,
                    hash: imageInfo.Id,
                    os: imageInfo.Os,
                    size: imageInfo.Size,
                },
            );
        } catch (e) {
            let status: `${ProcessStatus}`;

            if (
                analysis.build_status === ProcessStatus.STARTED ||
                analysis.build_status === ProcessStatus.STARTING
            ) {
                // todo: if started & starting trigger is to far back in time, status should also be failed.
                status = analysis.build_status;
            } else {
                status = ProcessStatus.FAILED;
            }

            await context.handle(
                AnalysisBuilderEvent.CHECK_FINISHED,
                {
                    ...value,
                    status,
                },
            );
        }
    }
}
