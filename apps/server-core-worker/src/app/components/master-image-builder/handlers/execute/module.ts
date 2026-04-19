/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { LogFlag } from '@privateaim/telemetry-kit';
import type { Client as DockerClient, ModemStreamWaitOptions } from 'docken';
import { waitForStream } from 'docken';
import type { MasterImage } from '@privateaim/core-kit';
import { REGISTRY_MASTER_IMAGE_PROJECT_NAME } from '@privateaim/core-kit';
import type {
    MasterImageBuilderEventMap,
    MasterImageBuilderExecutePayload,
} from '@privateaim/server-core-worker-kit';
import {
    MasterImageBuilderCommand,
    MasterImageBuilderEvent,
} from '@privateaim/server-core-worker-kit';
import type { ComponentHandler, ComponentHandlerContext, Logger } from '@privateaim/server-kit';
import type { Client as CoreClient } from '@privateaim/core-http-kit';
import path from 'node:path';
import tar from 'tar-fs';
import { MASTER_IMAGES_DIRECTORY_PATH } from '../../../../../constants';
import { buildDockerImageURL } from '../../../../../adapters/docker/index.ts';

export class MasterImageBuilderExecuteHandler implements ComponentHandler<
    MasterImageBuilderEventMap,
    MasterImageBuilderCommand.EXECUTE
> {
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
        payload: MasterImageBuilderExecutePayload,
        context: ComponentHandlerContext<MasterImageBuilderEventMap, MasterImageBuilderCommand.EXECUTE>,
    ) {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.handleInternal(payload, context);
        } catch (e) {
            this.logger?.error({
                message: e,
                command: MasterImageBuilderCommand.EXECUTE,
                event: MasterImageBuilderEvent.EXECUTION_FAILED,
            });

            await context.handle(
                MasterImageBuilderEvent.EXECUTION_FAILED,
                {
                    ...payload,
                    error: e,
                },
            );
        }
    }

    async handleInternal(
        payload: MasterImageBuilderExecutePayload,
        context: ComponentHandlerContext<MasterImageBuilderEventMap, MasterImageBuilderCommand.EXECUTE>,
    ) {
        await context.handle(
            MasterImageBuilderEvent.EXECUTION_STARTED,
            payload,
        );

        const masterImage = await this.coreClient.masterImage.getOne(payload.id);

        try {
            await this.buildImage(masterImage, {
                onBuilding: async (progress) => {
                    await context.handle(
                        MasterImageBuilderEvent.EXECUTION_PROGRESS,
                        {
                            progress,
                            id: masterImage.id,
                        },
                    );
                },
            });
        } catch {
            this.logger?.info({
                message: 'Building image failed',
                command: MasterImageBuilderCommand.EXECUTE,
                master_image_id: masterImage.id,
                [LogFlag.REF_ID]: masterImage.id,
            });
        }

        await context.handle(
            MasterImageBuilderEvent.EXECUTION_FINISHED,
            payload,
        );
    }

    protected async buildImage(
        masterImage: MasterImage,
        options: ModemStreamWaitOptions = {},
    ) {
        this.logger?.info({
            message: 'Building image',
            command: MasterImageBuilderCommand.EXECUTE,
            master_image_id: masterImage.id,
            [LogFlag.REF_ID]: masterImage.id,
        });

        const imageTag = buildDockerImageURL({
            projectName: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
            repositoryName: masterImage.virtual_path,
            tagOrDigest: 'latest',
        });

        const imageFilePath = path.join(MASTER_IMAGES_DIRECTORY_PATH, masterImage.path);

        const pack = tar.pack(imageFilePath);
        const stream = await this.docker
            .buildImage(pack, {
                t: imageTag,
                platform: 'linux/amd64',
            });

        await waitForStream(this.docker, stream, {
            onFinished: () => {
                this.logger?.info({
                    message: 'Built image',
                    command: MasterImageBuilderCommand.EXECUTE,
                    master_image_id: masterImage.id,
                    [LogFlag.REF_ID]: masterImage.id,
                });
            },
            ...options,
        });
    }
}
