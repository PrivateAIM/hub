/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { LogFlag } from '@privateaim/telemetry-kit';
import stream from 'node:stream';
import type { Analysis } from '@privateaim/core-kit';
import {
    AnalysisBucketType,
} from '@privateaim/core-kit';
import type { Container } from 'dockerode';
import tar from 'tar-stream';
import { AnalysisBuilderCommand } from '@privateaim/server-core-worker-kit';
import {
    streamToBuffer, useCoreClient, useStorageClient,
} from '../../../core';
import { AnalysisContainerPath } from '../constants';
import { BuilderError } from '../error';
import { useAnalysisBuilderLogger } from '../utils';

export async function packContainerWithAnalysis(container: Container, entity: Analysis) {
    const pack = tar.pack();

    // -----------------------------------------------------------------------------------

    useAnalysisBuilderLogger()
        .debug('Writing files to container', {
            command: AnalysisBuilderCommand.EXECUTE,
            analysis_id: entity.id,
            [LogFlag.REF_ID]: entity.id,
        });

    const core = useCoreClient();

    const { data: analysisBuckets } = await core.analysisBucket.getMany({
        filters: {
            type: AnalysisBucketType.CODE,
            analysis_id: entity.id,
        },
    });

    const [analysisBucket] = analysisBuckets;
    if (!analysisBucket) {
        throw BuilderError.entrypointNotFound();
    }

    const storage = useStorageClient();
    return new Promise<void>((resolve, reject) => {
        storage.bucket.stream(analysisBucket.external_id)
            .then((response) => {
                const extract = tar.extract();

                const files : [string, Buffer][] = [];

                extract.on('entry', (header, stream, callback) => {
                    streamToBuffer(stream)
                        .then((buff) => {
                            useAnalysisBuilderLogger()
                                .debug(`Extracting analysis file ${header.name} (${header.size} bytes).`, {
                                    command: AnalysisBuilderCommand.EXECUTE,
                                    analysis_id: entity.id,
                                    [LogFlag.REF_ID]: entity.id,
                                });

                            files.push([header.name, buff]);

                            callback();
                        })
                        .catch((e) => {
                            useAnalysisBuilderLogger()
                                .error(`Extracting analysis file ${header.name} (${header.size} bytes) failed.`, {
                                    command: AnalysisBuilderCommand.EXECUTE,
                                    analysis_id: entity.id,
                                    [LogFlag.REF_ID]: entity.id,
                                });
                            callback(e);
                        });
                });

                extract.on('error', () => {
                    reject(new BuilderError({
                        message: 'The analysis file stream could not be extracted',
                    }));
                });

                extract.on('finish', () => {
                    for (let i = 0; i < files.length; i++) {
                        useAnalysisBuilderLogger()
                            .debug(`Encrypting/Packing analysis file ${files[i][0]}.`, {
                                command: AnalysisBuilderCommand.EXECUTE,
                                analysis_id: entity.id,
                                [LogFlag.REF_ID]: entity.id,
                            });

                        pack.entry({ name: files[i][0] }, files[i][1]);

                        useAnalysisBuilderLogger()
                            .debug(`Encrypted/Packed analysis file ${files[i][0]}.`, {
                                command: AnalysisBuilderCommand.EXECUTE,
                                analysis_id: entity.id,
                                [LogFlag.REF_ID]: entity.id,
                            });
                    }

                    pack.finalize();

                    container.putArchive(pack, { path: AnalysisContainerPath.CODE })
                        .then(() => resolve())
                        .catch(() => reject(new BuilderError({
                            message: 'The analysis pack stream could not be forwarded to the container.',
                        })));
                });

                const readStream = stream.Readable.fromWeb(response as any);

                readStream.pipe(extract);
            })
            .catch((e) => reject(e));
    });
}
