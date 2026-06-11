/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { REGISTRY_ARTIFACT_TAG_LATEST } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import type {
    AnalysisBuilderCheckPayload,
    AnalysisBuilderEventMap,
} from '@privateaim/server-core-worker-kit';
import { AnalysisBuilderCommand, AnalysisBuilderEvent } from '@privateaim/server-core-worker-kit';
import type { ComponentHandler, ComponentHandlerContext, Logger } from '@privateaim/server-kit';
import type { Client as CoreClient } from '@privateaim/core-http-kit';
import type { Client as DockerClient } from 'docken';
import type { ImageInspectInfo } from 'dockerode';
import { isDockerNotFoundError } from '../../../../../adapters/docker/index.ts';
import { isAnalysisProcessStale } from '../../../helpers.ts';

export class AnalysisBuilderCheckHandler implements ComponentHandler<AnalysisBuilderEventMap, AnalysisBuilderCommand.CHECK> {
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
        value: AnalysisBuilderCheckPayload,
        context: ComponentHandlerContext<AnalysisBuilderEventMap, AnalysisBuilderCommand.CHECK>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.handleInternal(value, context);
        } catch (e) {
            this.logger?.error({
                message: e,
                command: AnalysisBuilderCommand.CHECK,
                analysis_id: value.id,
                [LogFlag.REF_ID]: value.id,
                event: AnalysisBuilderEvent.CHECK_FAILED,
            });

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
        value: AnalysisBuilderCheckPayload,
        context: ComponentHandlerContext<AnalysisBuilderEventMap, AnalysisBuilderCommand.CHECK>,
    ): Promise<void> {
        await context.handle(
            AnalysisBuilderEvent.CHECK_STARTED,
            value,
        );

        const analysis = await this.coreClient.analysis.getOne(value.id);

        const image = this.docker.getImage(`${value.id}:${REGISTRY_ARTIFACT_TAG_LATEST}`);

        let imageInfo : ImageInspectInfo | undefined;

        try {
            imageInfo = await image.inspect();
        } catch (e) {
            // anything but "no such image" means the daemon is broken,
            // so the image state is unknown and no verdict can be made.
            if (!isDockerNotFoundError(e)) {
                throw e;
            }
        }

        if (imageInfo) {
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

            return;
        }

        let status: `${ProcessStatus}`;

        if (
            analysis.build_status === ProcessStatus.STARTED ||
            analysis.build_status === ProcessStatus.STARTING
        ) {
            // an in-progress build refreshes the entity via progress events;
            // a long-untouched one is orphaned (e.g. worker died) and recoverable as FAILED.
            status = isAnalysisProcessStale(analysis.updated_at) ?
                ProcessStatus.FAILED :
                analysis.build_status;
        } else if (analysis.build_status === ProcessStatus.EXECUTED) {
            // fail-safe: the local image must only exist while no distribution
            // explains its absence (the distributor removes it during/after a run).
            if (
                !analysis.distribution_status ||
                analysis.distribution_status === ProcessStatus.FAILED ||
                analysis.distribution_status === ProcessStatus.STOPPED
            ) {
                status = ProcessStatus.FAILED;
            } else {
                status = analysis.build_status;
            }
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
