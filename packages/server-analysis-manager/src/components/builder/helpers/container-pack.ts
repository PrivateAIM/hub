/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import stream from 'node:stream';
import type { APIClient } from '@privateaim/core';
import { AnalysisContainerPath } from '@privateaim/core';
import type { Container } from 'dockerode';
import { useClient } from 'hapic';
import tar from 'tar-stream';
import {
    streamToBuffer,
} from '../../../core';
import { BuilderCommand } from '../constants';
import { BuilderError } from '../error';
import { useBuilderLogger } from '../utils';
import type { ContainerPackContext } from './type';

export async function packContainerWithTrain(container: Container, context: ContainerPackContext) {
    const pack = tar.pack();

    // -----------------------------------------------------------------------------------

    useBuilderLogger()
        .debug('Writing files to container', {
            command: BuilderCommand.BUILD,
        });

    const client = useClient<APIClient>();

    return new Promise<void>((resolve, reject) => {
        client.request({
            url: client.analysis.getFilesDownloadPath(context.train.id),
            responseType: 'stream',
        })
            .then((response) => {
                const extract = tar.extract();

                const files : [string, Buffer][] = [];

                extract.on('entry', (header, stream, callback) => {
                    streamToBuffer(stream)
                        .then((buff) => {
                            useBuilderLogger()
                                .debug(`Extracting train file ${header.name} (${header.size} bytes).`, {
                                    command: BuilderCommand.BUILD,
                                });

                            files.push([header.name, buff]);

                            callback();
                        })
                        .catch((e) => {
                            useBuilderLogger()
                                .error(`Extracting train file ${header.name} (${header.size} bytes) failed.`, {
                                    command: BuilderCommand.BUILD,
                                });
                            callback(e);
                        });
                });

                extract.on('error', () => {
                    reject(new BuilderError('The train file stream could not be extracted'));
                });

                extract.on('finish', () => {
                    for (let i = 0; i < files.length; i++) {
                        useBuilderLogger()
                            .debug(`Encrypting/Packing analysis file ${files[i][0]}.`, {
                                command: BuilderCommand.BUILD,
                            });

                        pack.entry({ name: files[i][0] }, files[i][1]);

                        useBuilderLogger()
                            .debug(`Encrypted/Packed analysis file ${files[i][0]}.`, {
                                command: BuilderCommand.BUILD,
                            });
                    }

                    pack.finalize();

                    container.putArchive(pack, { path: AnalysisContainerPath.MAIN })
                        .then(() => resolve())
                        .catch(() => reject(new BuilderError('The analysis pack stream could not be forwarded to the container.')));
                });

                const readStream = stream.Readable.fromWeb(response.data as any);

                readStream.pipe(extract);
            })
            .catch((e) => reject(e));
    });
}
