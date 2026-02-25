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

export type DockerContainerPackOptions = {
    path: string,

    validateEntry?: (entry: Headers) => void,

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

        container.putArchive(pack, { path: options.path })
            .then(() => resolve())
            .catch((err) => {
                if (err) {
                    reject(err);
                    return;
                }

                reject(new Error('The pack stream could not be forwarded to the container'));
            });

        extract.on('entry', (headers, stream, callback) => {
            if (options.onEntryPackStarted) {
                options.onEntryPackStarted(headers);
            }

            if (options.validateEntry) {
                try {
                    options.validateEntry(headers);
                } catch (e) {
                    callback(e);

                    return;
                }
            }

            const entry = pack.entry(
                headers,
                (err) => {
                    if (err) {
                        if (options.onEntryPackFailed) {
                            options.onEntryPackFailed(err, headers);
                        }

                        callback(err);
                        return;
                    }

                    if (options.onEntryPackFinished) {
                        options.onEntryPackFinished(headers);
                    }

                    callback();
                },
            );

            stream.on('data', (chunk) => entry.write(chunk));

            stream.on('end', () => {
                entry.end();
            });

            stream.on('error', (err) => {
                if (options.onEntryPackFailed) {
                    options.onEntryPackFailed(err, headers);
                }

                entry.destroy(err);
            });

            stream.resume();
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
        });

        readable.pipe(extract);
    });
}
