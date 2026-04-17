/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import {
    AnalysisBucketType,
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
import type { Client as CoreClient } from '@privateaim/core-http-kit';
import type { APIClient as StorageClient } from '@privateaim/storage-kit';
import type { Client as DockerClient, ModemStreamWaitOptions  } from 'docken';
import { waitForStream } from 'docken';
import type { Container } from 'dockerode';
import stream from 'node:stream';
import { createGzip } from 'node:zlib';
import tar from 'tar-stream';
import {
    cleanupDockerImage,
    packDockerContainerWithTarStream,
} from '../../../../../adapters/docker/index.ts';
import { AnalysisContainerPath } from '../../constants';
import { BuilderError } from '../../error';
import { generateDockerFileContent } from '../../helpers';
import { createAnalysisBuilderLogger } from '../../utils';

export class AnalysisBuilderExecuteHandler implements ComponentHandler<AnalysisBuilderEventMap, AnalysisBuilderCommand.EXECUTE> {
    protected coreClient: CoreClient;

    protected storageClient: StorageClient;

    protected docker: DockerClient;

    constructor(ctx: {
        coreClient: CoreClient; 
        storageClient: StorageClient; 
        docker: DockerClient 
    }) {
        this.coreClient = ctx.coreClient;
        this.storageClient = ctx.storageClient;
        this.docker = ctx.docker;
    }

    async handle(
        value: AnalysisBuilderExecutePayload,
        context: ComponentHandlerContext<AnalysisBuilderEventMap, AnalysisBuilderCommand.EXECUTE>,
    ): Promise<void> {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.handleInternal(value, context);
        } catch (e) {
            createAnalysisBuilderLogger().error({
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
                { routing: AnalysisBuilderEventQueueRouterRouting },
            );

            await cleanupDockerImage(this.docker, value.id);
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

        const analysis = await this.coreClient.analysis.getOne(value.id);

        // -----------------------------------------------------------------------------------

        try {
            await this.buildImage(analysis, {
                onBuilding: async (progress) => {
                    await context.handle(
                        AnalysisBuilderEvent.EXECUTION_PROGRESS,
                        {
                            progress,
                            id: analysis.id,
                        },
                    );
                },
            });
        } catch (e) {
            createAnalysisBuilderLogger()
                .error('Building image failed', {
                    command: AnalysisBuilderCommand.EXECUTE,
                    analysis_id: analysis.id,
                    [LogFlag.REF_ID]: analysis.id,
                });

            throw e;
        }

        // -----------------------------------------------------------------------------------

        let container : Container;

        try {
            container = await this.createContainer(analysis);
        } catch (e) {
            createAnalysisBuilderLogger()
                .error('Creating container failed', {
                    command: AnalysisBuilderCommand.EXECUTE,
                    analysis_id: analysis.id,
                    [LogFlag.REF_ID]: analysis.id,
                });

            throw e;
        }

        // -----------------------------------------------------------------------------------

        try {
            await this.packContainer(container, analysis);
        } catch (e) {
            createAnalysisBuilderLogger()
                .error('Packing container failed', {
                    command: AnalysisBuilderCommand.EXECUTE,
                    analysis_id: analysis.id,
                    [LogFlag.REF_ID]: analysis.id,
                });

            await container.remove({ force: true });

            throw e;
        }

        // -----------------------------------------------------------------------------------

        try {
            await this.commitContainer(container, analysis);
        } catch (e) {
            createAnalysisBuilderLogger()
                .error('Commiting container failed', {
                    command: AnalysisBuilderCommand.EXECUTE,
                    analysis_id: analysis.id,
                    [LogFlag.REF_ID]: analysis.id,
                });

            await container.remove({ force: true });

            throw e;
        }

        const image = this.docker.getImage(this.buildImageTag(analysis));
        const imageInfo = await image.inspect();

        await context.handle(
            AnalysisBuilderEvent.EXECUTION_FINISHED,
            {
                ...value,
                hash: imageInfo.Id,
                os: imageInfo.Os,
                size: imageInfo.Size,
            },
        );
    }

    protected buildImageTag(analysis: Analysis): string {
        return `${analysis.id}:${REGISTRY_ARTIFACT_TAG_LATEST}`;
    }

    protected async buildImage(
        analysis: Analysis,
        options: ModemStreamWaitOptions = {},
    ) {
        createAnalysisBuilderLogger().info({
            message: 'Building image',
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        const content = await generateDockerFileContent(analysis, {
            coreClient: this.coreClient,
            storageClient: this.storageClient,
        });

        const pack = tar.pack();
        const entry = pack.entry({
            name: 'Dockerfile',
            type: 'file',
            size: content.length,
        }, (err) => {
            if (err) {
                pack.destroy(err);
            }

            pack.finalize();
        });

        entry.write(content);
        entry.end();

        const buildStream = await this.docker
            .buildImage(pack.pipe(createGzip()), {
                t: this.buildImageTag(analysis),
                platform: 'linux/amd64',
            });

        return waitForStream(this.docker, buildStream, {
            onFinished: () => {
                createAnalysisBuilderLogger().info({
                    message: 'Built image',
                    command: AnalysisBuilderCommand.EXECUTE,
                    analysis_id: analysis.id,
                    [LogFlag.REF_ID]: analysis.id,
                });
            },
            ...options,
        });
    }

    protected async createContainer(analysis: Analysis) : Promise<Container> {
        createAnalysisBuilderLogger().info({
            message: 'Creating container',
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        const container = await this.docker
            .createContainer({ Image: this.buildImageTag(analysis) });

        createAnalysisBuilderLogger().info({
            message: 'Created container',
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        return container;
    }

    protected async packContainer(
        container: Container,
        analysis: Analysis,
    ) : Promise<void> {
        createAnalysisBuilderLogger()
            .info('Packing container', {
                command: AnalysisBuilderCommand.EXECUTE,
                analysis_id: analysis.id,
                [LogFlag.REF_ID]: analysis.id,
            });

        const { data: analysisBuckets } = await this.coreClient.analysisBucket.getMany({
            filters: {
                type: AnalysisBucketType.CODE,
                analysis_id: analysis.id,
            },
        });

        const [analysisBucket] = analysisBuckets;
        if (!analysisBucket) {
            throw BuilderError.entrypointNotFound();
        }

        const { data: analysisBucketFiles } = await this.coreClient
            .analysisBucketFile.getMany({ filters: { analysis_bucket_id: analysisBucket.id } });

        const webStream = await this.storageClient.bucket.stream(analysisBucket.bucket_id);
        const nodeStream = stream.Readable.fromWeb(webStream as any);

        await packDockerContainerWithTarStream(
            container,
            nodeStream,
            {
                path: AnalysisContainerPath.CODE,

                validateEntry: (entry) => {
                    if (!entry.type || entry.type !== 'file') {
                        return;
                    }

                    const index = analysisBucketFiles.findIndex((analysisBucketFile) => analysisBucketFile.path === entry.name);
                    if (index === -1) {
                        throw new Error(`Bucket file ${entry.name} is not a valid analysis bucket file.`);
                    }
                },

                onEntryPackStarted: (entry) => {
                    createAnalysisBuilderLogger()
                        .debug(`Packing ${entry.type} ${entry.name} (${entry.size} bytes)`, {
                            command: AnalysisBuilderCommand.EXECUTE,
                            analysis_id: analysis.id,
                            [LogFlag.REF_ID]: analysis.id,
                        });
                },
                onEntryPackFinished: (entry) => {
                    createAnalysisBuilderLogger()
                        .debug(`Packed ${entry.type} ${entry.name} (${entry.size} bytes)`, {
                            command: AnalysisBuilderCommand.EXECUTE,
                            analysis_id: analysis.id,
                            [LogFlag.REF_ID]: analysis.id,
                        });
                },
                onEntryPackFailed: (_, entry) => {
                    createAnalysisBuilderLogger()
                        .error(`Packing ${entry.type} ${entry.name} (${entry.size} bytes) failed`, {
                            command: AnalysisBuilderCommand.EXECUTE,
                            analysis_id: analysis.id,
                            [LogFlag.REF_ID]: analysis.id,
                        });
                },
            },
        );

        createAnalysisBuilderLogger()
            .info('Packed container', {
                command: AnalysisBuilderCommand.EXECUTE,
                analysis_id: analysis.id,
                [LogFlag.REF_ID]: analysis.id,
            });
    }

    protected async commitContainer(
        container: Container,
        analysis: Analysis,
    ) {
        createAnalysisBuilderLogger().info({
            message: 'Commiting container',
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        await container.commit({
            repo: analysis.id,
            tag: REGISTRY_ARTIFACT_TAG_LATEST,
        });

        createAnalysisBuilderLogger().info({
            message: 'Commited container',
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });
    }
}
