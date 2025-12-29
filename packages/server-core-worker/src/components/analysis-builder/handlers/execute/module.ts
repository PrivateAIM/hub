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
import type { ModemStreamWaitOptions } from 'docken';
import { waitForStream } from 'docken';
import type { Container } from 'dockerode';
import stream from 'node:stream';
import { createGzip } from 'node:zlib';
import tar from 'tar-stream';
import {
    cleanupDockerImage,
    packDockerContainerWithTarStream,
    useCoreClient,
    useDocker, useStorageClient,
} from '../../../../core';
import { AnalysisContainerPath } from '../../constants';
import { BuilderError } from '../../error';
import { generateDockerFileContent } from '../../helpers';
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
            useAnalysisBuilderLogger()
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
            useAnalysisBuilderLogger()
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
            useAnalysisBuilderLogger()
                .error('Packing container failed', {
                    command: AnalysisBuilderCommand.EXECUTE,
                    analysis_id: analysis.id,
                    [LogFlag.REF_ID]: analysis.id,
                });

            await container.remove({
                force: true,
            });

            throw e;
        }

        // -----------------------------------------------------------------------------------

        try {
            await this.commitContainer(container, analysis);
        } catch (e) {
            useAnalysisBuilderLogger()
                .info('Commiting container failed', {
                    command: AnalysisBuilderCommand.EXECUTE,
                    analysis_id: analysis.id,
                    [LogFlag.REF_ID]: analysis.id,
                });

            await container.remove({
                force: true,
            });

            throw e;
        }

        await container.remove({
            force: true,
        });

        await context.handle(
            AnalysisBuilderEvent.EXECUTION_FINISHED,
            value,
        );
    }

    protected async buildImage(
        analysis: Analysis,
        options: ModemStreamWaitOptions = {},
    ) {
        useAnalysisBuilderLogger().info({
            message: 'Building image',
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        const content = await generateDockerFileContent(analysis);

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

        const client = useDocker();
        const stream = await client
            .buildImage(pack.pipe(createGzip()), {
                t: analysis.id,
                platform: 'linux/amd64',
            });

        return waitForStream(client, stream, {
            onFinished: () => {
                useAnalysisBuilderLogger().info({
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
        useAnalysisBuilderLogger().info({
            message: 'Creating container',
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        const container = await useDocker()
            .createContainer({ Image: analysis.id });

        useAnalysisBuilderLogger().info({
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
        useAnalysisBuilderLogger()
            .info('Packing container', {
                command: AnalysisBuilderCommand.EXECUTE,
                analysis_id: analysis.id,
                [LogFlag.REF_ID]: analysis.id,
            });

        const core = useCoreClient();
        const { data: analysisBuckets } = await core.analysisBucket.getMany({
            filters: {
                type: AnalysisBucketType.CODE,
                analysis_id: analysis.id,
            },
        });

        const [analysisBucket] = analysisBuckets;
        if (!analysisBucket) {
            throw BuilderError.entrypointNotFound();
        }

        const storage = useStorageClient();
        const webStream = await storage.bucket.stream(analysisBucket.bucket_id);
        const nodeStream = stream.Readable.fromWeb(webStream as any);

        await packDockerContainerWithTarStream(
            container,
            nodeStream,
            {
                path: AnalysisContainerPath.CODE,

                onEntryPackStarted: (entry) => {
                    useAnalysisBuilderLogger()
                        .debug(`Packing ${entry.type} ${entry.name} (${entry.size} bytes)`, {
                            command: AnalysisBuilderCommand.EXECUTE,
                            analysis_id: analysis.id,
                            [LogFlag.REF_ID]: analysis.id,
                        });
                },
                onEntryPackFinished: (entry) => {
                    useAnalysisBuilderLogger()
                        .debug(`Packed ${entry.type} ${entry.name} (${entry.size} bytes)`, {
                            command: AnalysisBuilderCommand.EXECUTE,
                            analysis_id: analysis.id,
                            [LogFlag.REF_ID]: analysis.id,
                        });
                },
                onEntryPackFailed: (_, entry) => {
                    useAnalysisBuilderLogger()
                        .error(`Packing ${entry.type} ${entry.name} (${entry.size} bytes) failed`, {
                            command: AnalysisBuilderCommand.EXECUTE,
                            analysis_id: analysis.id,
                            [LogFlag.REF_ID]: analysis.id,
                        });
                },
            },
        );

        useAnalysisBuilderLogger()
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
        useAnalysisBuilderLogger().info({
            message: 'Commiting container',
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });

        await container.commit({
            tag: REGISTRY_ARTIFACT_TAG_LATEST,
        });

        useAnalysisBuilderLogger().info({
            message: 'Commited container',
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: analysis.id,
            [LogFlag.REF_ID]: analysis.id,
        });
    }
}
