/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Readable } from 'node:stream';
import type { Container } from 'dockerode';
import type { Headers } from 'tar-stream';
import tar from 'tar-stream';
import { streamToBuffer } from '../utils';

export type DockerContainerPackOptions = {
    path: string,

    onEntryPackStarted?: (entry: Headers) => Promise<void> | void,
    onEntryPackFinished?: (entry: Headers) => Promise<void> | void,
    onEntryPackFailed?: (error: Error, entry: Headers) => Promise<void> | void,
};

export async function packDockerContainerWithTarStream(
    container: Container,
    readable: Readable,
    options: DockerContainerPackOptions,
) {
    return new Promise<void>((resolve, reject) => {
        const pack = tar.pack();
        const extract = tar.extract();

        extract.on('entry', (header, stream, callback) => {
            if (options.onEntryPackStarted) {
                options.onEntryPackStarted(header);
            }

            streamToBuffer(stream)
                .then((buff) => {
                    pack.entry(
                        header,
                        buff,
                        (err) => {
                            if (err) {
                                if (options.onEntryPackFailed) {
                                    options.onEntryPackFailed(err, header);
                                }

                                callback(err);
                                return;
                            }

                            if (options.onEntryPackFinished) {
                                options.onEntryPackFinished(header);
                            }

                            callback();
                        },
                    );
                })
                .catch((e) => {
                    if (options.onEntryPackFailed) {
                        options.onEntryPackFailed(e, header);
                    }

                    callback(e);
                });
        });

        extract.on('error', (err) => {
            if (err) {
                reject(err);
                return;
            }

            reject(new Error('The tar extraction stream failed'));
        });

        extract.on('finish', () => {
            pack.finalize();

            container.putArchive(pack, { path: options.path })
                .then(() => resolve())
                .catch((err) => {
                    if (err) {
                        reject(err);
                    }

                    reject(new Error('The pack stream could not be forwarded to the container'));
                });
        });

        readable.pipe(extract);
    });
}
